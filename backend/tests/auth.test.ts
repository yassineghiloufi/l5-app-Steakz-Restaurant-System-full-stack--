import request from 'supertest';
import app from '../src/app';

describe('Auth API', () => {
  it('should return validation error when login payload is incomplete', async () => {
    const response = await request(app).post('/api/auth/login').send({ email: 'test@steakz.com' });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ success: false, message: 'Email and password are required' });
  });
});
