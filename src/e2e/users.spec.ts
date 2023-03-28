import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import { dbConnect } from '../db/connect.db';
import { PayloadToken } from '../helpers/auth';
import { UserModel } from '../repository/user.mongo.model';

export const setUserCollection = async () => {
  const usersMock = [
    { username: 'test1', email: 'test1@testing.cl', passwd: 'testpwd123' },
    { username: 'test2', email: 'test2@testing.cl', passwd: 'testpwd123' },
    { username: 'test3', email: 'test3@testing.cl', passwd: 'testpwd123' },
  ];
  await UserModel.deleteMany().exec();
  await UserModel.insertMany(usersMock);
  const data = await UserModel.find().exec();
  const mockUsersId: string[] = [data[0].id, data[1].id, data[2].id];
  return mockUsersId;
};

describe('Given the REST Api with a /users path and a connection with MongoDB', () => {
  let payload: PayloadToken;
  beforeEach(async () => {
    await dbConnect();
    const mockUsersId = await setUserCollection();
    payload = {
      id: mockUsersId[0],
      email: 'test1@testing.cl',
      role: 'user',
    };
  });
  afterEach(async () => {
    await mongoose.disconnect();
  });

  describe('When we do a post method to the /register route', () => {
    test('If it has all the required information, resp status code should be 202', async () => {
      const registerMock = {
        email: 'super@test.cl',
        passwd: 'joaquincito123',
        username: 'JOAQUIN_XD',
      };
      const response = await request(app)
        .post('/users/register')
        .send(registerMock);
      expect(response.status).toBe(202);
    });
  });
  describe('When we do a post method to the /login route', () => {
    test('If it has all the required information, resp status code should be 201', async () => {
      const registerMock = {
        email: 'super@test.cl',
        passwd: 'joaquincito123',
        username: 'JOAQUIN_XD',
      };
      const loginMock = {
        email: 'super@test.cl',
        passwd: 'joaquincito123',
      };
      await request(app).post('/users/register').send(registerMock);
      const response = await request(app).post('/users/login').send(loginMock);
      expect(response.status).toBe(201);
    });
    test('Then if the password is missing (or wrong), the status code should be 401', async () => {
      const registerMock = {
        email: 'super@test.cl',
        passwd: 'joaquincito1234',
        username: 'JOAQUIN_XD',
        lastName: 'bezanilla',
      };
      const errorLoginMock = {
        email: 'super@test.cl',
        passwd: 'joaquincito123',
      };
      await request(app).post('/users/register').send(registerMock);
      const response = await request(app)
        .post('/users/login')
        .send(errorLoginMock);
      expect(response.status).toBe(401);
    });
    test('Then if the email is not found in the database, the status should be 401', async () => {
      const loginMock = {
        email: 'joaquin@testquenoencontramos',
        password: 'literallydoesntmatter',
      };
      const response = await request(app).post('/users/login').send(loginMock);
      expect(response.status).toBe(401);
    });
  });
});