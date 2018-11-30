import mongoose from 'mongoose';
import MongodbMemoryServer from 'mongodb-memory-server';
import request from 'supertest';

import Donation from '../../../../src/models/donation';
import Establishment from '../../../../src/models/establishment';
import User from '../../../../src/models/user';

import app from '../../../../server';
import { importJsonToDatabase } from '../../testing-helper';

import { canEditAsCreator } from '../../../../src/middlewares/can-access-donation';
import { JWTService } from '../../../../src/services/jwt.service';
import logger from '../../../../src/services/logger.service';


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
    { model: Establishment, filePath: __dirname + '/establishments.json', createIndex: true },
    { model: User, filePath: __dirname + '/users.json', createIndex: true },
    { model: Donation, filePath: __dirname + '/donations.json', createIndex: false }
  ]);
});


afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});


// Array : user id => user JWT token
const userTokens = new Map();
for (let i = 1; i <= 3; i++) userTokens.set(i, JWTService.encode({ _id: i }));


describe('Tests donation restriction policy', async () => {

  it('should not be allowed - because Kattelea token is not sent', async () => {
    const resp = await request(app).get('/donation/1');
    expect(resp.status).toBe(401);
  });

  // Check donation access
  it('should NOT be allowed - because user is not in user 1 network', async () => {
    const resp = await request(app).get('/donation/1').set({ 'Katellea-Token': userTokens.get(3) });
    expect(resp.status).toBe(404);
  });

  it('should be allowed - because user is in user 1 network', async () => {
    const resp = await request(app).get('/donation/1').set({ 'Katellea-Token': userTokens.get(2) });
    expect(resp.status).toBe(200);
  });

  it('should be allowed - because user is creator', async () => {
    const resp = await request(app).get('/donation/1').set({ 'Katellea-Token': userTokens.get(1) });
    expect(resp.status).toBe(200);
  });


  // Check canEditAsCreator
  it("should be allowed to update as creator - because user 1 is creator", async () => {
    let donation = await Donation.findById(1);
    let userAllowed = canEditAsCreator(donation, { id: 1 });
    expect(userAllowed).toBeTruthy();
  });

  it("should NOT be allowed to update as creator - because user 2 & 3 are NOT creator", async () => {
    let donation = await Donation.findById(1);
    expect(canEditAsCreator(donation, { id: 2 })).toBeFalsy();
    expect(canEditAsCreator(donation, { id: 3 })).toBeFalsy();
  });

});