import fs from 'fs';
import csv from 'fast-csv';
import mongoose from 'mongoose';
import slugify from 'slugify';

import { environment } from '../../conf/environment';
import City from '../../src/models/city';
import logger from '../../src/services/logger.service';

// Database connection
const database = environment.database;
const mongoUrl = process.env.MONGO_URL || `mongodb://${database.username}:${database.password}@${database.host}:${database.port}/${database.name}`;
mongoose.connect(mongoUrl, { useNewUrlParser: true });


// Columns indexes
const ZIPCODE_INDEX = 0;
const NAME_INDEX = 3;
const LATITUDE_INDEX = 11;
const LONGITUDE_INDEX = 12;

const stream = fs.createReadStream('./scripts/cities/france.csv');
let count = 0;
let insertOrUpdate = 0;

stream
  .pipe(csv({ delimiter: ',' }))
  .on('data', async values => {

    // Necessary when inserting a lot of datas !
    // https://github.com/C2FO/fast-csv/issues/24
    if(values[LONGITUDE_INDEX] && values[LATITUDE_INDEX]) {
      count++;
      stream.pause();

      const zipcode = +values[ZIPCODE_INDEX];

      let city = await City.findOne({ zipcode });
      if(!city) city = new City();

      city.department = +values[ZIPCODE_INDEX].substr(0, 2);
      city.name = values[NAME_INDEX];
      city.slug = slugify(values[NAME_INDEX], { lower: true });
      city.zipcode = values[ZIPCODE_INDEX];
      city.longitude = parseFloat(values[LONGITUDE_INDEX]);
      city.latitude = parseFloat(values[LATITUDE_INDEX]);

      // Increment and relaunch stream if necessary
      insertOrUpdate++;
      if (insertOrUpdate === count) stream.resume();

      logger.info(`Create or update : ${insertOrUpdate}-${city.zipcode} => ${city.name}, ${city.slug}, ${city.longitude}, ${city.latitude}, , ${city.department}`);
      city.save();
    }

  })
  .on('end', () => {
    // Fixme : ugly force exit...
    setTimeout(() => process.exit(1), 20000);
  });