import { pool } from '../config/database.js';
import { redisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';
import { flightSearchSchema, createFlightSchema, flightIdSchema } from '../validations/flightValidation.js';

const CO2_EMISSIONS_FACTOR = 0.115;

export function calculateCO2Emissions(distanceKm) {
  return distanceKm * CO2_EMISSIONS_FACTOR;
}

export async function getFlights(search) {
  try {
    // Validate search parameters if provided
    if (search) {
      const { error, value } = flightSearchSchema.validate(search, {
        abortEarly: false,
        stripUnknown: true
      });
      if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        throw new Error(`Validation error: ${errorMessage}`);
      }
      search = value;
    }
    const cacheKey = `flights:${JSON.stringify(search)}`;
    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }
    let query = 'SELECT * FROM flights WHERE 1=1';
    const params = [];
    let paramCount = 1;
    if (search?.departureCity) {
      query += ` AND departure_city = $${paramCount}`;
      params.push(search.departureCity);
      paramCount++;
    }
    if (search?.destinationCity) {
      query += ` AND destination_city = $${paramCount}`;
      params.push(search.destinationCity);
      paramCount++;
    }
    if (search?.date) {
      query += ` AND DATE(departure_time) = $${paramCount}`;
      params.push(search.date);
      paramCount++;
    }
    if (search?.arrivalDate) {
      query += ` AND DATE(arrival_time) = $${paramCount}`;
      params.push(search.arrivalDate);
      paramCount++;
    }
    if (search?.airline) {
      query += ` AND airline = $${paramCount}`;
      params.push(search.airline);
      paramCount++;
    }
    if (search?.minPrice) {
      query += ` AND price >= $${paramCount}`;
      params.push(search.minPrice);
      paramCount++;
    }
    if (search?.maxPrice) {
      query += ` AND price <= $${paramCount}`;
      params.push(search.maxPrice);
      paramCount++;
    }
    // Add sorting
    if (search?.sortBy) {
      const sortOrder = search.sortOrder === 'desc' ? 'DESC' : 'ASC';
      switch (search.sortBy) {
        case 'price':
          query += ` ORDER BY price ${sortOrder}`;
          break;
        case 'departureTime':
          query += ` ORDER BY departure_time ${sortOrder}`;
          break;
        case 'duration':
          query += ` ORDER BY (arrival_time - departure_time) ${sortOrder}`;
          break;
        default:
          logger.warn(`Invalid sortBy parameter: ${search.sortBy}`);
          break;
      }
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      logger.info('No flights found for the given search criteria');
      return [];
    }
    
    // Format dates to ISO string
    const formattedFlights = result.rows.map(flight => ({
      ...flight,
      departure_time: new Date(flight.departure_time).toISOString(),
      arrival_time: new Date(flight.arrival_time).toISOString()
    }));

    // Cache the result for 5 minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(formattedFlights));
    return formattedFlights;
  } catch (error) {
    logger.error('Error fetching flights:', error);
    const isDev = process.env.NODE_ENV !== 'production';
    throw new Error(isDev ? (error.message || 'Failed to fetch flights') : 'Failed to fetch flights');
  }
}

export async function getFlightById(id) {
  try {
    const { error } = flightIdSchema.validate({ id });
    if (error) {
      throw new Error(`Validation error: ${error.details[0].message}`);
    }
    const result = await pool.query('SELECT * FROM flights WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new Error('Flight not found');
    }
    
    // Format dates to ISO string
    const flight = result.rows[0];
    return {
      ...flight,
      departure_time: new Date(flight.departure_time).toISOString(),
      arrival_time: new Date(flight.arrival_time).toISOString()
    };
  } catch (error) {
    logger.error('Error fetching flight:', error);
    const isDev = process.env.NODE_ENV !== 'production';
    throw new Error(isDev ? (error.message || 'Failed to fetch flight') : 'Failed to fetch flight');
  }
}

export async function createFlight(args) {
  try {
    const { error, value } = createFlightSchema.validate(args, {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new Error(`Validation error: ${errorMessage}`);
    }
    const validatedArgs = value;
    const result = await pool.query(
      `INSERT INTO flights (
        flight_number, airline, departure_city, destination_city,
        departure_time, arrival_time, price, distance_km
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        validatedArgs.flightNumber,
        validatedArgs.airline,
        validatedArgs.departureCity,
        validatedArgs.destinationCity,
        validatedArgs.departureTime,
        validatedArgs.arrivalTime,
        validatedArgs.price,
        validatedArgs.distanceKm,
      ]
    );
    // Invalidate relevant caches
    const keys = await redisClient.keys('flights:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return result.rows[0];
  } catch (error) {
    logger.error('Error creating flight:', error);
    const isDev = process.env.NODE_ENV !== 'production';
    throw new Error(isDev ? (error.message || 'Failed to create flight') : 'Failed to create flight');
  }
} 