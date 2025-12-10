import { Request, Response, NextFunction } from 'express';

/**
 * Centralized error handling middleware.
 * Logs errors and sends a consistent error response.
 */
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // Log error details for debugging
  // eslint-disable-next-line no-console
  console.error(`[${new Date().toISOString()}] Error:`, err);

  // Determine status code
  const status = err.status || err.statusCode || 500;

  // Prevent leaking sensitive error details in production
  const message =
    status >= 500
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'An error occurred.';

  res.status(status).json({
    error: true,
    message,
  });
};

export default errorHandler;