import { jest } from '@jest/globals';

// Mock DB and Cloudinary
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
    },
    Otp: { create: jest.fn() }
  }
}));

jest.unstable_mockModule('../config/cloudinaryConfig.js', () => ({
    storage: {}
}));

const { app } = await import('../server.js');
const request = (await import('supertest')).default;
const db = (await import('../models/index.js')).default;

describe('Registration API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    db.UserDetail.findOne.mockResolvedValue(null);
    db.UserDetail.create.mockResolvedValue({ id: 1, email: 'new@example.com' });

    const res = await request(app)
      .post('/register')
      .field('email', 'new@example.com')
      .field('password', 'password123')
      .field('phone', '1234567890');
      // Intentionally not attaching file to avoid multer complexity in basic test

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Registration successful');
  });

  it('should fail if user already exists', async () => {
    db.UserDetail.findOne.mockResolvedValue({ email: 'existing@example.com' });

    const res = await request(app)
      .post('/register')
      .field('email', 'existing@example.com')
      .field('password', 'password123');

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('User already exists');
  });
});
