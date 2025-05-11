import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Flight {
    id: ID!
    flightNumber: String!
    airline: String!
    departureCity: String!
    destinationCity: String!
    departureTime: String!
    arrivalTime: String!
    price: Float!
    distanceKm: Float!
    co2Emissions: Float!
  }

  input FlightSearchInput {
    departureCity: String
    destinationCity: String
    date: String
    arrivalDate: String
    sortBy: String
    sortOrder: String
    airline: String
    minPrice: Float
    maxPrice: Float
  }

  type Query {
    flights(search: FlightSearchInput): [Flight!]!
    flight(id: ID!): Flight
  }

  type Mutation {
    createFlight(
      flightNumber: String!
      airline: String!
      departureCity: String!
      destinationCity: String!
      departureTime: String!
      arrivalTime: String!
      price: Float!
      distanceKm: Float!
    ): Flight!
  }
`; 