import { Pool } from 'pg';
import { logger } from '../utils/logger.js';

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'flight_search',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
});

let isConnected = false;

const connectDB = async (retryCount = 0) => {
  try {
    await pool.connect();
    isConnected = true;
    logger.info('Connected to PostgreSQL database');
    
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS flights (
        id SERIAL PRIMARY KEY,
        flight_number VARCHAR(10) NOT NULL,
        airline VARCHAR(100) NOT NULL,
        departure_city VARCHAR(100) NOT NULL,
        destination_city VARCHAR(100) NOT NULL,
        departure_time TIMESTAMP NOT NULL,
        arrival_time TIMESTAMP NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        distance_km DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_flights_departure_city ON flights(departure_city);
      CREATE INDEX IF NOT EXISTS idx_flights_destination_city ON flights(destination_city);
      CREATE INDEX IF NOT EXISTS idx_flights_departure_time ON flights(departure_time);
    `);
    
    logger.info('Database tables created/verified');
  } catch (error) {
    logger.error('Error connecting to PostgreSQL:', error);
    isConnected = false;
    if (retryCount < 5) {
      const delay = Math.pow(2, retryCount) * 1000;
      logger.info(`Retrying PostgreSQL connection in ${delay / 1000}s...`);
      setTimeout(() => connectDB(retryCount + 1), delay);
    } else {
      throw error;
    }
  }
};

const healthCheck = async () => {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    isConnected = false;
    return false;
  }
};

export { pool, connectDB, healthCheck }; 