import mongoose from 'mongoose';
import MongodbMemoryServer from 'mongodb-memory-server';
import request from 'supertest';

import app from '../../../server';
import { importJsonToDatabase } from '../testing-helper';
import Establishment from '../../../src/models/establishment';
import City from '../../../src/models/city';


let server = request(app)
let mongoServer = new MongodbMemoryServer();

beforeAll(async () => {

  const mongoUri = await mongoServer.getConnectionString();
  await mongoose.connect(mongoUri, { useNewUrlParser: true }, (err) => {
    if (err) console.error(err);
  });
  await mongoose.connection.db.dropDatabase();

  importJsonToDatabase([
    { model: City, filePath: __dirname + '/cities.json', createIndex: true },
    { model: Establishment, filePath: __dirname + '/establishments.json', createIndex: true }
  ]);
});


afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});



describe('Tests establishment API', async () => {

  it("should return Nantes as the closest establishment from longitude/latitude", async () => {
    let response = await server.get('/establishment/closest?longitude=-1.5298952&latitude=47.2220922');
    let body = JSON.parse(response.text);
    expect(body[0].name).toBe('EFS Nantes');
    expect(body[1].name).toBe('EFS Paris 12ème');
  });

  it("should return Nantes as the closest establishment with zipcode 44620", async () => {
    let response = await server.get('/establishment/closest?zipcode=44620');
    let body = JSON.parse(response.text);
    expect(body[0].name).toBe('EFS Nantes');
    expect(body[1].name).toBe('EFS Paris 12ème');
  });

  it("should return Paris as the closest establishment from longitude/latitude", async () => {
    let response = await server.get('/establishment/closest?longitude=2.333333&latitude=48.866667');
    let body = JSON.parse(response.text);
    expect(body[0].name).toBe('EFS Paris 12ème');
    expect(body[1].name).toBe('EFS Nantes');
  });

  it("should return Paris as the closest establishment with zipcode 59777", async () => {
    let response = await server.get('/establishment/closest?zipcode=59777');
    let body = JSON.parse(response.text);
    expect(body[0].name).toBe('EFS Paris 12ème');
    expect(body[1].name).toBe('EFS Nantes');
  });

  it("should return error 404 with zipcode XXX", async () => {
    let response = await server.get('/establishment/closest?zipcode=XXX');
    expect(response.status).toBe(404);
  });

});