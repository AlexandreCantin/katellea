import mongoose from 'mongoose';
import { environment } from '../../conf/environment';
import * as Sentry from '@sentry/node';
import logger from '../services/logger.service';

const databaseKey = process.env.NODE_ENV === 'testing' ? 'databaseTest' : 'database';
const database = environment[databaseKey];

// MONGO_DB
const initMongoDB = () => {
  const mongoUrl = process.env.MONGO_URL || `mongodb://${database.host}:${database.port}/${database.name}`;
  mongoose.connect(mongoUrl, { useNewUrlParser: true }, err => {
    if(err) {
      Sentry.captureException(err);
      logger.error(err.message);
      process.exit(1);
    }
  });
}

export default initMongoDB;
