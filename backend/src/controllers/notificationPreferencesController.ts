import { getRepository } from 'typeorm';
import { NotificationPreference } from '../models/NotificationPreference';
import { User } from '../models/User';
import { encryptPreferences, decryptPreferences } from '../utils/encryption';

/**
 * Business logic for notification preferences.
 */
const notificationPreferencesController = {
  /**
   * Get notification preferences for a user.
   * Decrypts preferences before returning.
   * @param userId User ID
   * @returns Preferences object { [eventType]: boolean }
   */
  async getPreferences(userId: string): Promise<{ [eventType: string]: boolean }> {
    const repo = getRepository(NotificationPreference);
    const pref = await repo.findOne({ where: { userId } });
    if (!pref) {
      // Return default preferences if none exist
      return {};
    }
    try {
      return decryptPreferences(pref.encryptedPreferences);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to decrypt preferences:', err);
      throw new Error('Failed to load notification preferences.');
    }
  },

  /**
   * Update notification preferences for a user.
   * Encrypts preferences before saving.
   * Operation is atomic.
   * @param userId User ID
   * @param preferences Preferences object { [eventType]: boolean }
   */
  async updatePreferences(userId: string, preferences: { [eventType: string]: boolean }): Promise<void> {
    const repo = getRepository(NotificationPreference);
    const userRepo = getRepository(User);

    // Ensure user exists
    const user = await userRepo.findOne(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    // Encrypt preferences
    let encrypted: string;
    try {
      encrypted = encryptPreferences(preferences);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to encrypt preferences:', err);
      throw new Error('Failed to save notification preferences.');
    }

    // Use transaction for atomic update
    await repo.manager.transaction(async (transactionalEntityManager) => {
      let pref = await transactionalEntityManager.findOne(NotificationPreference, { where: { userId } });
      if (!pref) {
        pref = transactionalEntityManager.create(NotificationPreference, {
          userId,
          encryptedPreferences: encrypted,
        });
      } else {
        pref.encryptedPreferences = encrypted;
      }
      await transactionalEntityManager.save(pref);
    });
  },
};

export default notificationPreferencesController;