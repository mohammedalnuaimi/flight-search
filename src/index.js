import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { logger } from './utils/logger.js';
import { connectDB, healthCheck } from './config/database.js';
import { connectRedis } from './config/redis.js';
import { seedData } from './config/seed.js';
import { typeDefs } from './graphql/schemas/index.js';
import resolvers from './graphql/resolvers/index.js';

// Initialize Express app
const app = express();

// Create HTTP server using Express app
const httpServer = createServer(app);

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
}));

// Handle OPTIONS requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://studio.apollographql.com');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'content-type, apollo-require-preflight');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.use(express.json());
app.use(morgan('dev'));

// Initialize Apollo GraphQL server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true
});

// Start and apply Apollo middleware to Express
await apolloServer.start();
app.use('/graphql', expressMiddleware(apolloServer, {
  context: async ({ req, res }) => {
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', 'https://studio.apollographql.com');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return { req, res };
  },
  cors: {
    origin: 'https://studio.apollographql.com',
    credentials: true,
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['content-type', 'apollo-require-preflight'],
    exposedHeaders: ['access-control-allow-origin', 'access-control-allow-credentials']
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Database health check endpoint
app.get('/db-health', async (req, res) => {
  const healthy = await healthCheck();
  res.status(healthy ? 200 : 500).json({ status: healthy ? 'ok' : 'unhealthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Server configuration
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Initialize database and cache connections
    await connectDB();
    await connectRedis();
    
    // Seed sample data
    await seedData();
    
    // Start HTTP server (which includes both Express and Apollo)
    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();