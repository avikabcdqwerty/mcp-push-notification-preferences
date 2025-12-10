import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createConnection } from 'typeorm';
import notificationPreferencesRoutes from './routes/notificationPreferences';
import productsRoutes from './routes/products';
import errorHandler from './middleware/errorHandler';
import authMiddleware from './middleware/auth';

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app: Application = express();

// Middleware: security headers
app.use(helmet());

// Middleware: CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// Middleware: request logging
app.use(morgan('combined'));

// Middleware: parse JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Auth endpoints (stub for demonstration; should be replaced with real implementation)
app.get('/api/auth/me', authMiddleware, (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
  });
});

app.post('/api/auth/logout', authMiddleware, (_req: Request, res: Response) => {
  // Invalidate JWT on client side; server-side stateless JWT does not require action
  res.status(200).json({ message: 'Logged out' });
});

// Protected routes
app.use('/api/notification-preferences', authMiddleware, notificationPreferencesRoutes);
app.use('/api/products', authMiddleware, productsRoutes);

// Centralized error handler
app.use(errorHandler);

// Start server after DB connection
const PORT = process.env.PORT || 4000;

createConnection()
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 MCP Push Notification Preferences API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
  });

// Export app for testing
export default app;