import { Router, Request, Response, NextFunction } from 'express';
import notificationPreferencesController from '../controllers/notificationPreferencesController';

// Create router for notification preferences
const router = Router();

/**
 * @route GET /:userId
 * @desc Get notification preferences for a user
 * @access Authenticated users only (enforced by middleware)
 */
router.get(
  '/:userId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Only allow users to access their own preferences
      // @ts-ignore
      if (req.user.id !== req.params.userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const preferences = await notificationPreferencesController.getPreferences(
        req.params.userId
      );
      res.status(200).json({ preferences });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route PUT /:userId
 * @desc Update notification preferences for a user
 * @access Authenticated users only (enforced by middleware)
 */
router.put(
  '/:userId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Only allow users to update their own preferences
      // @ts-ignore
      if (req.user.id !== req.params.userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const { preferences } = req.body;
      if (!preferences || typeof preferences !== 'object') {
        return res
          .status(400)
          .json({ message: 'Invalid preferences payload.' });
      }
      await notificationPreferencesController.updatePreferences(
        req.params.userId,
        preferences
      );
      res.status(200).json({ message: 'Preferences updated successfully.' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;