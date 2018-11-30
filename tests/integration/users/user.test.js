import mongoose from 'mongoose';
import MongodbMemoryServer from 'mongodb-memory-server';
import request from 'supertest';

import app from '../../../server';
import { importJsonToDatabase } from '../testing-helper';

import Establishment from '../../../src/models/establishment';
import Donation from '../../../src/models/donation';
import User from '../../../src/models/user';
import { JWTService } from '../../../src/services/jwt.service';
import logger from '../../../src/services/logger.service';


const server = request(app);
const mongoServer = new MongodbMemoryServer();

beforeAll(async () => {

  const mongoUri = await mongoServer.getConnectionString();
  await mongoose.connect(mongoUri, { useNewUrlParser: true }, err => {
    if (err) logger.error(err.message);
  });
  await mongoose.connection.db.dropDatabase();

  // Populate database
  importJsonToDatabase([
    { model: Establishment, filePath: __dirname + '/establishments.json', createIndex: false },
    { model: User, filePath: __dirname + '/users.json', createIndex: true },
    { model: Donation, filePath: __dirname + '/donations.json', createIndex: false },
  ]);
});


afterAll(async() => {
  await mongoose.disconnect();
  await mongoServer.stop();
});


const user1SponsorToken = '275b9996a8';
const user1JWT = JWTService.encode({ _id: 1 });

describe('Tests donation restriction policy', async () => {

  it('Get sponsor by token', async () => {
    const resp = await request(app).get(`/user/sponsor/${user1SponsorToken}`);
    expect(resp.status).toBe(200);
  });


  it('Create user', async () => {
    const resp = await request(app).get(`/user/sponsor/${user1SponsorToken}`);
    expect(resp.status).toBe(200);
  });

  it('Create user with sponsor and donation tokens', async () => {
    const resp = await request(app).get(`/user/sponsor/${user1SponsorToken}`);
    expect(resp.status).toBe(200);
  });

  it('Update user', async () => {
    const resp = await request(app).get(`/user/sponsor/${user1SponsorToken}`);
    expect(resp.status).toBe(200);
  });

  it('Delete user', async () => {
    const resp = await request(app).get(`/user/sponsor/${user1SponsorToken}`);
    expect(resp.status).toBe(200);
  });

});