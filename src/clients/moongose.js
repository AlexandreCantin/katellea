import mongoose from 'mongoose';
import { environment } from '../../conf/environment';
import { sendError } from '../helper';


const databaseKey = process.env.NODE_ENV === 'testing' ? 'databaseTest' : 'database';
const database = environment[databaseKey];

// MONGO_DB
const initMongoDB = () => {
  const mongoUrl = process.env.MONGO_URL || `mongodb://${database.username}:${database.password}@${database.host}:${database.port}/${database.name}`;
  mongoose.connect(mongoUrl, { useNewUrlParser: true }, err => {
    if(err) {
      sendError(err);
      process.exit(1);
    }
  });
};

export default initMongoDB;
