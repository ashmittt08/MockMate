import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import router from './routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Register API routes
app.use('/api', router);

// Catch-all route for unhandled requests (404)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    status: 'not_found',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${statusCode} - ${message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    status: 'error',
    message,
    timestamp: new Date().toISOString(),
  });
});

export default app;
