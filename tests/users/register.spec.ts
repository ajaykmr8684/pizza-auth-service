import request from 'supertest';
import app from '../../src/app';

describe('POST /auth/register', () => {
  describe('Given all fields', () => {
    it('should return 200 OK status code', async () => {
      //Arrange
      const userData = {
        firstName: 'Ajay',
        lastName: 'Kumar',
        email: 'informalajay@gmail.com',
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
      };
      //Act
      const response = await request(app).post('/auth/register').send(userData);
      //Assert
      expect(response.headers['content-type']).toEqual(
        expect.stringContaining('json'),
      );
    });

    it('should persist the user in the database', async () => {
      //Arrange
      // const userData = {
      //     firstName: "Ajay",
      //     lastName: "Kumar",
      //     email: "informalajay@gmail.com"
      // }
      //Act
      // const response = await request(app).post("/auth/register").send(userData);
      //Assert
    });
  });

  describe('Fields are missing', () => {});
});
