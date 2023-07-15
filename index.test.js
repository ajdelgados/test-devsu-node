import { Sequelize } from 'sequelize';
import request from 'supertest';
import { app, server, handle } from '.';
import User from './users/model';
import { addUserSchema } from './shared/schema/users';
import sequelize from './shared/database/database';

describe('User', () => {
  let data;
  let mockedSequelize;

  beforeEach(async () => {
    data = {
      dni: '1234567890',
      name: 'Test',
    };
    jest.spyOn(console, 'log').mockImplementation(jest.fn());
    jest.spyOn(sequelize, 'log').mockImplementation(jest.fn());
    mockedSequelize = new Sequelize({
      database: '<any name>',
      dialect: 'sqlite',
      username: 'root',
      password: '',
      validateOnly: true,
      models: [`${__dirname}/models`],
    });
    await mockedSequelize.sync({ force: true });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await mockedSequelize.close();
  });

  afterAll(async () => {
    server.close();
  });

  test('Get users', async () => {
    jest.spyOn(User, 'findAll').mockResolvedValue([data]);
    const response = await request(app).get('/api/users');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([data]);
  });

  test('Get user', async () => {
    jest.spyOn(User, 'findByPk').mockResolvedValue({ ...data, id: 1 });
    const response = await request(app).get('/api/users/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ...data, id: 1 });
  });

  test('Create user', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(User, 'create').mockResolvedValue({ ...data, id: 1 });
    const response = await request(app).post('/api/users').send(data);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ ...data, id: 1 });
  });

  test('User not found', async () => {
    jest.spyOn(User, 'findByPk').mockResolvedValue(null);
    const response = await request(app).get('/api/users/1');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'User not found: 1' });
  });

  test('Get users internar server error', async () => {
    jest.spyOn(User, 'findAll').mockImplementation(() => {
      throw new Error();
    });
    const response = await request(app).get('/api/users');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal Server Error' });
  });

  test('Get user internar server error', async () => {
    jest.spyOn(User, 'findByPk').mockImplementation(() => {
      throw new Error();
    });
    const response = await request(app).get('/api/users/1');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal Server Error' });
  });

  test('Create user, alredy exists', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue({ ...data, id: 1 });
    const response = await request(app).post('/api/users').send(data);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: `User already exists: ${data.dni}` });
  });

  test('Create user, internal server error', async () => {
    jest.spyOn(User, 'findOne').mockImplementation(() => {
      throw new Error();
    });
    const response = await request(app).post('/api/users').send(data);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal Server Error' });
  });

  test('Create user, malformed request', async () => {
    const response = await request(app).post('/api/users').send();
    try {
      await addUserSchema.validate({}, { abortEarly: false });
    } catch (error) {
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errors: (error).inner.map(
          ({ message, path }) => ({
            message,
            path,
          }),
        ),
      });
    }
  });
});

describe('Index', () => {
  test('Health', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ health: 'ok' });
  });

  test('Close handle', async () => {
    const response = await handle('SIGINT');

    expect(response).toBe(undefined);
  });
});
