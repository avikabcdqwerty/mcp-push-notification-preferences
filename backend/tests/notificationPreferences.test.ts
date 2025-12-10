import request from 'supertest';
import { createConnection, getConnection, getRepository } from 'typeorm';
import app from '../src/server';
import { User } from '../src/models/User';
import { NotificationPreference } from '../src/models/NotificationPreference';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-secret';

describe('Notification Preferences API', () => {
  let user: User;
  let token: string;

  beforeAll(async () => {
    await createConnection();
    // Create a test user
    const userRepo = getRepository(User);
    user = userRepo.create({
      username: 'testuser',
      email: 'testuser@example.com',
      passwordHash: 'hashedpassword',
    });
    await userRepo.save(user);

    // Generate JWT token for test user
    token = jwt.sign(
      { sub: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    await getRepository(NotificationPreference).delete({ userId: user.id });
    await getRepository(User).delete({ id: user.id });
    await getConnection().close();
  });

  describe('GET /api/notification-preferences/:userId', () => {
    it('should return default preferences if none exist', async () => {
      const res = await request(app)
        .get(`/api/notification-preferences/${user.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('preferences');
      expect(typeof res.body.preferences).toBe('object');
    });

    it('should return 403 if accessing another user\'s preferences', async () => {
      const res = await request(app)
        .get(`/api/notification-preferences/invalid-user-id`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .get(`/api/notification-preferences/${user.id}`);
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/notification-preferences/:userId', () => {
    const prefs = {
      order_created: true,
      order_shipped: false,
      product_updated: true,
    };

    it('should update preferences for authenticated user', async () => {
      const res = await request(app)
        .put(`/api/notification-preferences/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ preferences: prefs });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Preferences updated successfully.');

      // Verify preferences are updated
      const getRes = await request(app)
        .get(`/api/notification-preferences/${user.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.preferences).toEqual(prefs);
    });

    it('should return 400 for invalid payload', async () => {
      const res = await request(app)
        .put(`/api/notification-preferences/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ preferences: null });
      expect(res.status).toBe(400);
    });

    it('should return 403 if updating another user\'s preferences', async () => {
      const res = await request(app)
        .put(`/api/notification-preferences/invalid-user-id`)
        .set('Authorization', `Bearer ${token}`)
        .send({ preferences: prefs });
      expect(res.status).toBe(403);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .put(`/api/notification-preferences/${user.id}`)
        .send({ preferences: prefs });
      expect(res.status).toBe(401);
    });
  });
});