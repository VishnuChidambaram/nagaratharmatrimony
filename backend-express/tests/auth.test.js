import { jest } from '@jest/globals';

// Mock the database models before importing the app
jest.unstable_mockModule('../models/index.js', () => ({
  default: {
    sequelize: {
      authenticate: jest.fn().mockResolvedValue(true),
      sync: jest.fn().mockResolvedValue(true),
      Sequelize: { Op: { or: 'or' } }
    },
    UserDetail: {
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    Otp: {
      create: jest.fn(),
      findOne: jest.fn(),
    },
    AdminLogin: {
        findOne: jest.fn()
    }
  }
}));

// Mock Cloudinary config
jest.unstable_mockModule('../config/cloudinaryConfig.js', () => ({
    storage: {}
}));

const { app } = await import('../server.js');
const request = (await import('supertest')).default;
const db = (await import('../models/index.js')).default;

describe('Authentication API', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /login', () => {
    it('should login successfully with correct credentials', async () => {
      // Mock finding a user
      db.UserDetail.findOne.mockResolvedValue({
        email: 'test@example.com',
        password: 'password123',
        update: jest.fn().mockResolvedValue(true)
      });

      const res = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Login successful');
    });

    it('should fail with incorrect credentials', async () => {
      // Mock finding a user
      db.UserDetail.findOne.mockResolvedValue({
        email: 'test@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should fail if user not found', async () => {
      db.UserDetail.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });
  });
});
