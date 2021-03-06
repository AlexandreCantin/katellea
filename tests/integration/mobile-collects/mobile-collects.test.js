import mongoose from 'mongoose';
import MongodbMemoryServer from 'mongodb-memory-server';
import request from 'supertest';

import app from '../../../server';
import { importJsonToDatabase } from '../testing-helper';
import City from '../../../src/models/city';
import MobileCollect from '../../../src/models/mobile-collect';
import logger from '../../../src/services/logger.service';


const server = request(app);
const mongoServer = new MongodbMemoryServer();

beforeAll(async () => {

  const mongoUri = await mongoServer.getConnectionString();
  await mongoose.connect(mongoUri, { useNewUrlParser: true }, err => {
    if (err) logger.error(err.message);
  });
  await mongoose.connection.db.dropDatabase();

  importJsonToDatabase([
    { model: City, filePath: __dirname + '/cities.json', createIndex: true },
    { model: MobileCollect, filePath: __dirname + '/mobile-collects.json', createIndex: true }
  ]);
});


afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});



describe('Tests mobile collects API', async () => {

  it('should return \'SAINT JULIEN l ARS\' as the closest mobile collect from longitude/latitude', async () => {
    const response = await server.get('/mobile-collect/closest?longitude=-1.5298952&latitude=47.2220922');
    const body = JSON.parse(response.text);
    expect(body[0].place).toBe('SAINT JULIEN l ARS');
    expect(body[0].city).toBe('ST JULIEN L ARS');
  });

  it('should return \'SAINT JULIEN l ARS\' as the closest mobile collect with zipcode 44620', async () => {
    const response = await server.get('/mobile-collect/closest?zipcode=44620');
    const body = JSON.parse(response.text);
    expect(body[0].place).toBe('SAINT JULIEN l ARS');
    expect(body[0].city).toBe('ST JULIEN L ARS');
  });

  it('should return \'PAVILLON DU VERDURIER - LIMOGES\' as the closest mobile collect from longitude/latitude', async () => {
    const response = await server.get('/mobile-collect/closest?longitude=4.835659&latitude=45.764043');
    const body = JSON.parse(response.text);
    expect(body[0].place).toBe('PAVILLON DU VERDURIER');
    expect(body[0].city).toBe('LIMOGES');
  });

  it('should return \'PAVILLON DU VERDURIER - LIMOGES\' as the closest mobile collect with zipcode 69001', async () => {
    const response = await server.get('/mobile-collect/closest?zipcode=69001');
    const body = JSON.parse(response.text);
    expect(body[0].place).toBe('PAVILLON DU VERDURIER');
    expect(body[0].city).toBe('LIMOGES');
  });

  it('should return error 404 with zipcode XXX', async () => {
    const response = await server.get('/mobile-collect/closest?zipcode=XXX');
    expect(response.status).toBe(404);
  });

});