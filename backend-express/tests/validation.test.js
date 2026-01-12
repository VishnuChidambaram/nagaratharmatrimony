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

describe('Registration Validation API', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fail registration if required fields are missing', async () => {
    const res = await request(app)
      .post('/register')
      .send({}); // Missing everything

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors).toContain('Name is required');
    expect(res.body.errors).toContain('Email is required');
    expect(res.body.errors).toContain('Phone number is required');
    expect(res.body.errors).toContain('Password is required');
    expect(res.body.errors).toContain('Gender is required');
    expect(res.body.errors).toContain('Date of birth is required');
  });

  it('should fail registration with invalid email format', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        name: 'Test User',
        email: 'invalid-email',
        phone: '1234567890',
        password: 'StrongP@ss123',
        gender: 'Male',
        dateOfBirth: '1990-01-01'
      });


    expect(res.body.errors).toContain('Invalid email format');
  });

  it('should fail registration with invalid phone format', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        phone: '12345', // Too short
        password: 'StrongP@ss123',
        gender: 'Male',
        dateOfBirth: '1990-01-01'
      });


    expect(res.body.errors).toContain('Phone number must be 10 digits');
  });

  it('should fail registration with weak password', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'weak',
        gender: 'Male',
        dateOfBirth: '1990-01-01'
      });


    expect(res.body.success).toBe(false);
    expect(res.body.errors).toContain('Password must be at least 8 characters long');
    expect(res.body.errors).toContain('Password must contain at least one uppercase letter');
    expect(res.body.errors).toContain('Password must contain at least one special character');
  });

  it('should fail registration if user is under 18', async () => {
    const underageDate = new Date();
    underageDate.setFullYear(underageDate.getFullYear() - 17);
    const dobString = underageDate.toISOString().split('T')[0];

    const res = await request(app)
      .post('/register')
      .send({
        name: 'Young User',
        email: 'young@example.com',
        phone: '1234567890',
        password: 'StrongP@ss123',
        gender: 'Male',
        dateOfBirth: dobString
      });


    expect(res.body.errors).toContain('You must be at least 18 years old to register');
  });

  it('should fail registration with invalid temple selection', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'StrongP@ss123',
        gender: 'Male',
        dateOfBirth: '1990-01-01',
        yourTemple: 'NonExistent Kovil'
      });


    expect(res.body.errors).toContain('Invalid temple selection');
  });

  it('should fail password reset with weak password', async () => {
    // Mock user exists
    db.UserDetail.findOne.mockResolvedValue({ email: 'test@example.com' });

    const res = await request(app)
      .post('/reset-password')
      .send({
        email: 'test@example.com',
        newPassword: 'weak'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Password does not meet security requirements');
    expect(res.body.errors).toContain('Password must be at least 8 characters long');
  });
});
