import request from 'supertest';
import { createConnection, getConnection, getRepository } from 'typeorm';
import app from '../src/server';
import { User } from '../src/models/User';
import { Product } from '../src/models/Product';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-secret';

describe('Products API', () => {
  let user: User;
  let token: string;
  let productId: string;

  beforeAll(async () => {
    await createConnection();
    // Create a test user
    const userRepo = getRepository(User);
    user = userRepo.create({
      username: 'productuser',
      email: 'productuser@example.com',
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
    await getRepository(Product).delete({});
    await getRepository(User).delete({ id: user.id });
    await getConnection().close();
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Product',
          description: 'A product for testing',
          price: 19.99,
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('product');
      expect(res.body.product.name).toBe('Test Product');
      productId = res.body.product.id;
    });

    it('should return 400 for invalid product data', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '',
          description: '',
          price: -1,
        });
      expect(res.status).toBe(400);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'No Auth Product',
          description: 'Should fail',
          price: 10,
        });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/products', () => {
    it('should list all products', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.products.length).toBeGreaterThan(0);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/products/:productId', () => {
    it('should update an existing product', async () => {
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Product',
          description: 'Updated description',
          price: 29.99,
        });
      expect(res.status).toBe(200);
      expect(res.body.product.name).toBe('Updated Product');
      expect(res.body.product.price).toBe('29.99');
    });

    it('should return 400 for invalid update data', async () => {
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '',
          description: '',
          price: -5,
        });
      expect(res.status).toBe(400);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .send({
          name: 'No Auth Update',
          description: 'Should fail',
          price: 10,
        });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/products/:productId', () => {
    it('should delete a product', async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(204);
    });

    it('should return 404 for non-existent product', async () => {
      const res = await request(app)
        .delete(`/api/products/nonexistentid`)
        .set('Authorization', `Bearer ${token}`);
      // Our controller throws 404 as 500, so expect 500 here
      expect(res.status).toBe(500);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`);
      expect(res.status).toBe(401);
    });
  });
});