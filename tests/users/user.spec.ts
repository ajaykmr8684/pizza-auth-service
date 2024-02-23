import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import request from 'supertest';
import app from '../../src/app';
import createJWKSMock from 'mock-jwks';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';

describe('GET /auth/self', () => {
  /**
   * TEST SETUP
   */
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  //Initialising the DB first before any test
  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:5501');
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    //Database Truncate before each test
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(() => {
    jwks.stop();
  });

  //Closing the DB after the Suite ends
  afterAll(async () => {
    await connection.destroy();
  });

  //TEST BLOCKS
  describe('Given all fields', () => {
    it('should return 200 status code', async () => {
      const accessToken = jwks.token({ sub: '1', role: Roles.CUSTOMER });
      const response = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send();
      expect(response.statusCode).toBe(200);
    });

    it('should return user data', async () => {
      const userData = {
        firstName: 'Ajay',
        lastName: 'Kumar',
        email: 'informalajay@gmail.com',
        password: 'secret',
      };
      const userRepo = connection.getRepository(User);
      const user = await userRepo.save({ ...userData, role: Roles.CUSTOMER });

      const accessToken = jwks.token({ sub: String(user.id), role: user.role });

      const response = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken};`])
        .send();

      //ASSERT
      expect((response.body as Record<string, string>).id).toBe(user.id);
    });
  });
});
