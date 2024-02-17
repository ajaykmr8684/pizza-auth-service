import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import request from 'supertest';
import app from '../../src/app';

describe('POST /auth/login', () => {
  /**
   * TEST SETUP
   */
  let connection: DataSource;

  //Initialising the DB first before any test
  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    //Database Truncate before each test
    await connection.dropDatabase();
    await connection.synchronize();
  });

  //Closing the DB after the Suite ends
  afterAll(async () => {
    await connection.destroy();
  });

  //TEST BLOCKS

  describe('Given all fields', () => {
    it('should return 200 status code if login is successfull', async () => {
      //ARRANGE

      const registerUserData = {
        firstName: 'Ajay',
        lastName: 'Kumar',
        email: 'test@gmail.com ',
        password: 'secret',
      };

      const loginUserData = {
        email: 'test@gmail.com',
        password: 'secret',
      };

      //ACT
      //Register first
      await request(app).post('/auth/register').send(registerUserData);

      //Login once user is registered
      const response = await request(app)
        .post('/auth/login')
        .send(loginUserData);

      //ASSERT

      expect(response.statusCode).toBe(200);
    });

    it('should return 400 if username or password is wrong', async () => {
      //ARRANGE
      const registerUserData = {
        firstName: 'Ajay',
        lastName: 'Kumar',
        email: 'test@gmail.com ',
        password: 'secret',
      };

      const loginUserData = {
        email: 'tes1t@gmail.com',
        password: 'secret1',
      };

      //ACT
      await request(app).post('/auth/register').send(registerUserData);

      const response = await request(app)
        .post('/auth/login')
        .send(loginUserData);

      //ASSERT
      expect(response.statusCode).toBe(400);
    });
  });

  describe('Missing fields', () => {
    it('should return 400 status code if email or password is missing', async () => {
      //ARRANGE
      const loginUserData = {
        password: '',
      };

      //ACT

      const response = await request(app)
        .post('/auth/login')
        .send(loginUserData);

      //ASSERT
      expect(response.statusCode).toBe(400);
    });
  });

  describe('Fields are not in proper format', () => {
    it('should return 400 status code if email is in wrong format', async () => {
      //ARRANGE
      const loginUserData = {
        email: 'testasa',
        password: 'secret',
      };

      //ACT
      const response = await request(app)
        .post('/auth/login')
        .send(loginUserData);

      //ASSERT
      expect(response.statusCode).toBe(400);
    });
  });
});
