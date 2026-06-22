import { jest } from '@jest/globals';

// Mock DB
jest.unstable_mockModule('../models/index.js', () => ({
  default: {
    sequelize: {
      authenticate: jest.fn().mockResolvedValue(true),
      sync: jest.fn().mockResolvedValue(true),
      Sequelize: { Op: { or: 'or' } }
    },
    AdminLogin: {
      findOne: jest.fn(),
      update: jest.fn(),
    },
    UserDetail: {
        findAll: jest.fn().mockResolvedValue([]),
        findByPk: jest.fn(),
        update: jest.fn().mockResolvedValue([1]),
        destroy: jest.fn().mockResolvedValue(0),
    }
  }
}));

jest.unstable_mockModule('../config/cloudinaryConfig.js', () => ({
    storage: {}
}));

const { app } = await import('../server.js');
const request = (await import('supertest')).default;
const db = (await import('../models/index.js')).default;

describe('Admin API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login admin successfully', async () => {
    const hashedPassword = await (await import('bcrypt')).default.hash('adminpassword', 10);
    db.AdminLogin.findOne.mockResolvedValue({
      email: 'admin@example.com',
      password: hashedPassword,
      update: jest.fn().mockResolvedValue(true)
    });

    const res = await request(app)
      .post('/admin/login')
      .send({ email: 'admin@example.com', password: 'adminpassword' });

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Admin Login successful');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should fetch users list with auth', async () => {
    db.UserDetail.findAll.mockResolvedValue([{ id: 1, name: 'Test User' }]);
    db.AdminLogin.findOne.mockResolvedValue({
      email: 'admin@example.com',
      sessionId: 'admin-sess-123'
    });

    const res = await request(app)
      .get('/admin/users')
      .set('x-admin-email', 'admin@example.com')
      .set('x-admin-session-id', 'admin-sess-123');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should fail to fetch users list without auth', async () => {
    const res = await request(app).get('/admin/users');
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should fetch single user details with admin auth', async () => {
    db.UserDetail.findByPk.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      toJSON: () => ({ id: 1, email: 'user@example.com' })
    });
    db.AdminLogin.findOne.mockResolvedValue({
      email: 'admin@example.com',
      sessionId: 'admin-sess-123'
    });

    const res = await request(app)
      .get('/upload-details/1')
      .set('x-admin-email', 'admin@example.com')
      .set('x-admin-session-id', 'admin-sess-123');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('user@example.com');
  });
});
