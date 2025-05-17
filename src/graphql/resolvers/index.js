import * as flightService from "../../services/flightService.js";

const resolvers = {
  Flight: {
    flightNumber: (parent) => parent.flight_number,
    departureCity: (parent) => parent.departure_city,
    destinationCity: (parent) => parent.destination_city,
    departureTime: (parent) => parent.departure_time,
    arrivalTime: (parent) => parent.arrival_time,
    distanceKm: (parent) => parent.distance_km,
    co2Emissions: (parent) => flightService.calculateCO2Emissions(parent.distance_km),
  },
  Query: {
    flights: async (_, { search }) => {
      return flightService.getFlights(search);
    },
    flight: async (_, { id }) => {
      return flightService.getFlightById(id);
    },
  },
  Mutation: {
    createFlight: async (_, args) => {
      return flightService.createFlight(args);
    },
  },
};

export default resolvers;
