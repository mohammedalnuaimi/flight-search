import Joi from 'joi';

// Validation schema for flight search
export const flightSearchSchema = Joi.object({
  departureCity: Joi.string().trim(),
  destinationCity: Joi.string().trim(),
  date: Joi.string().isoDate().messages({
    'string.isoDate': 'Departure date must be in ISO format (YYYY-MM-DD)'
  }),
  arrivalDate: Joi.string().isoDate().messages({
    'string.isoDate': 'Arrival date must be in ISO format (YYYY-MM-DD)'
  }),
  sortBy: Joi.string().valid('price', 'departureTime', 'duration'),
  sortOrder: Joi.string().valid('asc', 'desc'),
  airline: Joi.string().trim(),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0)
}).custom((obj, helpers) => {
  // Custom validation for price range
  if (obj.minPrice && obj.maxPrice && obj.minPrice > obj.maxPrice) {
    return helpers.error('price.range', {
      message: 'Minimum price cannot be greater than maximum price'
    });
  }
  return obj;
});

// Validation schema for creating a flight
export const createFlightSchema = Joi.object({
  flightNumber: Joi.string().required().trim(),
  airline: Joi.string().required().trim(),
  departureCity: Joi.string().required().trim(),
  destinationCity: Joi.string().required().trim(),
  departureTime: Joi.string().required().isoDate().messages({
    'string.isoDate': 'Departure time must be in ISO format'
  }),
  arrivalTime: Joi.string().required().isoDate().messages({
    'string.isoDate': 'Arrival time must be in ISO format'
  }),
  price: Joi.number().required().min(0),
  distanceKm: Joi.number().required().min(0)
}).custom((obj, helpers) => {
  // Custom validation for arrival time after departure time
  const departureTime = new Date(obj.departureTime);
  const arrivalTime = new Date(obj.arrivalTime);
  
  if (arrivalTime <= departureTime) {
    return helpers.error('time.sequence', {
      message: 'Arrival time must be after departure time'
    });
  }
  return obj;
});

// Validation schema for flight ID
export const flightIdSchema = Joi.object({
  id: Joi.string().required().trim()
}); 