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
        findAll: jest.fn()
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
    db.AdminLogin.findOne.mockResolvedValue({
      email: 'admin@example.com',
      password: 'adminpassword',
      update: jest.fn().mockResolvedValue(true)
    });

    const res = await request(app)
      .post('/admin/login')
      .send({ email: 'admin@example.com', password: 'adminpassword' });

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Admin Login successful');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should fetch users list', async () => {
    db.UserDetail.findAll.mockResolvedValue([{ id: 1, name: 'Test User' }]);

    const res = await request(app).get('/admin/users');
    
    // Note: The current route /admin/users is NOT protected by middleware in the code provided!
    // It's a public route in the current implementation (server.js:97 app.use("/", userRoutes) etc?? No, server.js:96 app.use("/", authRoutes))
    // Wait, authRoutes.js:246 router.get("/admin/users"...)
    // There is no middleware check inside that route handler.
    // This confirms our security audit findings (though not explicitly mentioned, lack of auth check is bad).
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });
});
