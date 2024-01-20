import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';

describe('POST /auth/register', () => {
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

    it('should return an id of the created user in response', async () => {
      //Arrange
      const userData = {
        firstName: 'Ajay',
        lastName: 'Kumar',
        email: 'ajaykmr8684@gmail.com',
        password: 'secret',
      };

      //Act
      const response = await request(app).post('/auth/register').send(userData);

      //Assert
      expect(response.body).toHaveProperty('id');
    });

    it('should assign a customer role', async () => {
      //Arrange
      const userData = {
        firstName: 'Ajay',
        lastName: 'Kumar',
        email: 'ajaykmr8684@gmail.com',
        password: 'secret',
      };

      //Act
      await request(app).post('/auth/register').send(userData);

      //ASSERT
      const userRespository = connection.getRepository(User);
      const users = await userRespository.find();

      expect(users[0]).toHaveProperty('role');
      expect(users[0].role).toBe(Roles.CUSTOMER);
    });

    it('should store the hashed password', async () => {
      //Arrange
      const userData = {
        firstName: 'Ajay',
        lastName: 'Kumar',
        email: 'ajaykmr8684@gmail.com',
        password: 'secret',
      };

      //Act
      await request(app).post('/auth/register').send(userData);

      //ASSERT
      const userRespository = connection.getRepository(User);
      const users = await userRespository.find();
      expect(users[0].password).not.toBe('secret');
      expect(users[0].password).toHaveLength(60);
      expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
    });

    it('should return 400 status code if email already exists', async () => {
      //Arrange
      const userData = {
        firstName: 'Ajay',
        lastName: 'Kumar',
        email: 'ajaykmr8684@gmail.com',
        password: 'secret',
      };
      const userRespository = connection.getRepository(User);
      await userRespository.save({ ...userData, role: Roles.CUSTOMER });

      //Act
      const response = await request(app).post('/auth/register').send(userData);
      const users = await userRespository.find();

      //ASSERT;
      expect(response.statusCode).toBe(400);
      expect(users).toHaveLength(1);
    });
  });

  describe('Fields are missing', () => {
    it('should return 400 status code if email field is missing', async () => {
      //Arrange
      const userData = {
        firstName: 'Ajay',
        lastName: 'Kumar',
        email: '',
        password: 'secret',
      };

      //Act
      const response = await request(app).post('/auth/register').send(userData);

      //ASSERT
      expect(response.statusCode).toBe(400);

      const userRespository = connection.getRepository(User);
      const users = await userRespository.find();
      expect(users).toHaveLength(0);
    });
  });
});
