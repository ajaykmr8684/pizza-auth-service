import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { truncateTables } from '../utils';
import { User } from '../../src/entity/User';

describe('POST /auth/register', () => {
  let connection: DataSource;

  //Initialising the DB first before any test
  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    //Database Truncate before each test
    await truncateTables(connection);
  });

  //Closing the DB after the Suite ends
  afterAll(async () => {
    await connection.destroy();
  });

  describe('Given all fields', () => {
    it('should return 200 OK status code', async () => {
      //Arrange
      const userData = {
        firstName: 'Ajay',
        lastName: 'Kumar',
        email: 'informalajay@gmail.com',
        password: 'secret',
      };
      //Act
      const response = await request(app).post('/auth/register').send(userData);
      //Assert
      expect(response.statusCode).toBe(200);
    });

    it('should return response in json format', async () => {
      //Arrange
      const userData = {
        firstName: 'Ajay',
        lastName: 'Kumar',
        email: 'informalajay@gmail.com',
        password: 'secret',
      };
      //Act
      const response = await request(app).post('/auth/register').send(userData);
      //Assert
      expect(response.headers['content-type']).toEqual(
        expect.stringContaining('json'),
      );
    });

    it('should persist the user in the database', async () => {
      // Arrange
      const userData = {
        firstName: 'Ajay',
        lastName: 'Kumar',
        email: 'informalajay@gmail.com',
        password: 'secret',
      };
      // Act
      await request(app).post('/auth/register').send(userData);

      // Assert
      const userRespository = connection.getRepository(User);
      const users = await userRespository.find();
      expect(users).toHaveLength(1);
    });
  });

  describe('Fields are missing', () => {});
});
