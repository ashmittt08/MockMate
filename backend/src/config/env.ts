import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root of the backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
};

// Validate environment variables
if (isNaN(config.port)) {
  throw new Error('PORT environment variable must be a valid number.');
}

