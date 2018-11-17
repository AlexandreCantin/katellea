import mongoose from 'mongoose';
import { environment } from '../../conf/environment';

const databaseKey = process.env.NODE_ENV === 'testing' ? 'databaseTest' : 'database';
const database = environment[databaseKey];

// MONGO_DB
const initMongoDB = () => {
  const mongoUrl = process.env.MONGO_URL || `mongodb://${database.host}:${database.port}/${database.name}`;
  mongoose.connect(mongoUrl, { useNewUrlParser: true });
}

export default initMongoDB;
