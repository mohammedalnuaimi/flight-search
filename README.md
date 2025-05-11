# Flight Search API

A GraphQL API for searching flights with CO2 emissions calculation, built with Node.js, Express, Apollo Server, PostgreSQL, and Redis.

## Features

- Search flights by departure city, destination city, and date
- Calculate CO2 emissions based on flight distance
- Filter by airline and price range
- Sort by price, duration, or departure time
- Redis caching for improved performance
- PostgreSQL database for data storage
- Comprehensive logging and error handling
- Docker containerization for easy deployment

## Prerequisites

- Docker and Docker Compose
- Node.js (v20 or higher)
- npm

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   NODE_ENV=development
   PGHOST=postgres
   PGPORT=5432
   PGDATABASE=flight_search
   PGUSER=postgres
   PGPASSWORD=postgres
   REDIS_HOST=redis
   REDIS_PORT=6379
   LOG_LEVEL=info
   ```

## Running the Application

Using Docker Compose:
```bash
docker compose up --build
```

This will start:
- The Node.js application
- PostgreSQL database
- Redis cache

The GraphQL API can be explored using Apollo Studio Sandbox at `http://localhost:3000/graphql`. For the best development experience, it's recommended using Apollo Studio's web-based explorer at https://studio.apollographql.com/sandbox/explorer

## Database Seeding

To populate the database with sample flight data:
```bash
npm run seed
```

This will generate 500 realistic flight records with:
- Random flight numbers
- Various airlines
- Different cities
- Realistic prices and distances
- Future dates within 30 days

## GraphQL API

### Example Queries

Search for flights:
```graphql
query {
  flights(search: {
    departureCity: "New York",
    destinationCity: "London",
    date: "2024-05-01",
    sortBy: "price",
    sortOrder: "asc"
  }) {
    flightNumber
    airline
    departureCity
    destinationCity
    departureTime
    arrivalTime
    price
    distanceKm
    co2Emissions
  }
}
```

## System Design

### Architecture

The application follows a layered architecture:
- GraphQL API layer using Apollo Server
- Express middleware for request handling
- Service layer for business logic
- Data access layer for database operations
- Caching layer using Redis

### Database Schema

The main `flights` table stores:
- Flight details (number, airline, cities, times)
- Price and distance information
- Timestamps for creation

### Caching Strategy

- Flight search results are cached
- Redis is used for distributed caching
- Cache keys are based on search parameters

### Performance Considerations

- Indexed database columns for common queries
- Query optimization for complex searches
- Caching to reduce database load
- Connection pooling for database efficiency
- Docker containerization for consistent environments

## Error Handling

The application includes:
- Input validation
- Error logging using Winston
- Graceful error responses
- CORS configuration for Apollo Studio

## Development

To run the application in development mode:
```bash
npm run dev
```

To start the application:
```bash
npm start
```

To seed the database:
```bash
npm run seed
```

## Dependencies

### Main Dependencies
- @apollo/server: GraphQL server implementation
- express: Web framework
- pg: PostgreSQL client
- redis: Redis client
- winston: Logging
- helmet: Security middleware
- morgan: HTTP request logger

### Development Dependencies
- @faker-js/faker: Data generation for seeding
- nodemon: Development server with auto-reload

## Future Improvements

### 1. Rate Limiting & Protection
- Implement per-user/IP rate limiting to protect the API
- Add request throttling for expensive operations
- Set up abuse detection and prevention mechanisms

### 2. Connection Pool Optimization
- Configure optimal pool size based on expected load
- Add connection timeout and retry policies
- Implement connection health checks
- Fine-tune pool parameters for better resource utilization

### 3. Caching Strategy Enhancement
- Implement smarter cache invalidation strategies
- Configure different TTLs based on data volatility
- Add cache warming for popular searches
- Implement cache compression for large result sets
- Optimize cache key strategies

### 4. Monitoring & Observability
- Add request latency tracking
- Implement error rate monitoring
- Set up database query performance metrics
- Track cache hit/miss ratios
- Monitor system resource utilization
- Implement alerting for critical metrics

### 5. Load Balancing & Scaling
- Add horizontal scaling support
- Implement load balancing for multiple instances
- Configure database read replicas for heavy read operations

### 6. GraphQL Layer Improvements
- Implement service layer between resolvers and database
- Decouple schema from database structure
- Add field-level resolver optimization
- Implement proper error handling and validation
- Add GraphQL query complexity analysis

### 7. Security Enhancements
- Implement authentication using JWT/OAuth
- Add role-based authorization
- Restrict sensitive mutations/queries
- Add input sanitization and validation
- Implement rate limiting per user

These improvements would significantly enhance the system's reliability, performance, and ability to handle increased load while maintaining good user experience.
