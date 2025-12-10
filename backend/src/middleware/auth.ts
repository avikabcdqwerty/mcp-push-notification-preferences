import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { User } from '../models/User';

// JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'changeme-secret';

/**
 * Express middleware for JWT authentication and user population.
 * Attaches the user object to req.user if valid.
 */
const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header: "Bearer <token>"
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid token.' });
    }
    const token = authHeader.split(' ')[1];

    // Verify JWT
    let decoded: JwtPayload | string;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    // Extract user id from payload
    const userId =
      typeof decoded === 'object' && decoded.sub
        ? decoded.sub
        : typeof decoded === 'object' && decoded.id
        ? decoded.id
        : null;

    if (!userId) {
      return res.status(401).json({ message: 'Invalid token payload.' });
    }

    // Fetch user from DB
    const userRepo = getRepository(User);
    const user = await userRepo.findOne(userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    // Attach user to request
    // @ts-ignore
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    next();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: 'Authentication failed.' });
  }
};

export default authMiddleware;