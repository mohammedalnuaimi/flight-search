import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
if (!REDIS_HOST || !REDIS_PORT) {
  throw new Error('REDIS_HOST and REDIS_PORT must be set in environment variables');
}

const redisClient = createClient({
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info('Connected to Redis');
  } catch (error) {
    logger.error('Error connecting to Redis:', error);
    throw error;
  }
};

export { redisClient, connectRedis }; 