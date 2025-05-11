import { pool } from './database.js';
import { logger } from '../utils/logger.js';
import { faker } from '@faker-js/faker';

// List of major cities and their coordinates
const cities = [
  { name: 'New York', country: 'USA' },
  { name: 'London', country: 'UK' },
  { name: 'Paris', country: 'France' },
  { name: 'Tokyo', country: 'Japan' },
  { name: 'Dubai', country: 'UAE' },
  { name: 'Singapore', country: 'Singapore' },
  { name: 'Sydney', country: 'Australia' },
  { name: 'Hong Kong', country: 'China' },
  { name: 'Los Angeles', country: 'USA' },
  { name: 'Chicago', country: 'USA' },
  { name: 'Berlin', country: 'Germany' },
  { name: 'Rome', country: 'Italy' },
  { name: 'Mumbai', country: 'India' },
  { name: 'São Paulo', country: 'Brazil' },
  { name: 'Toronto', country: 'Canada' }
];

// List of airlines
const airlines = [
  'American Airlines',
  'British Airways',
  'Delta Airlines',
  'United Airlines',
  'Lufthansa',
  'Emirates',
  'Singapore Airlines',
  'Qatar Airways',
  'Cathay Pacific',
  'Air France',
  'KLM',
  'Turkish Airlines',
  'Qantas',
  'Etihad Airways',
  'Air Canada'
];

// Helper function to calculate distance between two cities (simplified)
const calculateDistance = () => {
  // This is a simplified distance calculation
  // In a real application, you would use actual coordinates and proper distance calculation
  return faker.number.float({ min: 500, max: 12000, precision: 0.01 });
};

// Helper function to calculate price based on distance
const calculatePrice = (distanceKm) => {
  const basePrice = distanceKm * 0.1; // $0.10 per km
  const randomFactor = faker.number.float({ min: 0.8, max: 1.2, precision: 0.01 });
  return Math.round(basePrice * randomFactor * 100) / 100;
};

// Generate a single flight record
const generateFlight = () => {
  const departureCity = faker.helpers.arrayElement(cities);
  let destinationCity;
  do {
    destinationCity = faker.helpers.arrayElement(cities);
  } while (destinationCity.name === departureCity.name);

  const airline = faker.helpers.arrayElement(airlines);
  const flightNumber = `${airline.substring(0, 2).toUpperCase()}${faker.number.int({ min: 100, max: 999 })}`;
  
  // Generate departure time within next 30 days
  const departureDateTime = faker.date.future({ years: 0.1 });
  
  const distanceKm = calculateDistance();
  
  // Calculate arrival time based on distance (assuming average speed of 800 km/h)
  const flightHours = distanceKm / 800;
  const arrivalDateTime = new Date(departureDateTime.getTime() + (flightHours * 60 * 60 * 1000));
  
  const price = calculatePrice(distanceKm);

  return {
    flight_number: flightNumber,
    airline,
    departure_city: departureCity.name,
    destination_city: destinationCity.name,
    departure_time: departureDateTime.toISOString(),
    arrival_time: arrivalDateTime.toISOString(),
    price,
    distance_km: distanceKm
  };
};

const seedData = async () => {
  try {
    // Clear existing data
    await pool.query('TRUNCATE TABLE flights RESTART IDENTITY CASCADE');

    // Generate 500 flight records
    const flights = Array.from({ length: 500 }, generateFlight);

    // Prepare the values string for the SQL query
    const values = flights.map(flight => `(
      '${flight.flight_number}',
      '${flight.airline}',
      '${flight.departure_city}',
      '${flight.destination_city}',
      '${flight.departure_time}',
      '${flight.arrival_time}',
      ${flight.price},
      ${flight.distance_km}
    )`).join(',');

    // Insert all flights in a single query
    await pool.query(`
      INSERT INTO flights (
        flight_number, airline, departure_city, destination_city,
        departure_time, arrival_time, price, distance_km
      ) VALUES ${values}
    `);

    logger.info(`Successfully inserted ${flights.length} flight records`);
  } catch (error) {
    logger.error('Error seeding data:', error);
    throw error;
  }
};

export { seedData }; 