import fs from 'fs';
import csv from 'fast-csv';
import mongoose from 'mongoose';

import { environment } from '../../conf/environment';
import City from '../../src/models/city';
import logger from '../../src/services/logger.service';

// Database connection
const database = environment.database;
const mongoUrl = process.env.MONGO_URL || `mongodb://${database.host}:${database.port}/${database.name}`;
mongoose.connect(mongoUrl, { useNewUrlParser: true });


// Columns indexes
const ID_INDEX = 0;
const NAME_INDEX = 2;
const SLUG_INDEX = 3;
const ZIPCODE_INDEX = 5;
const LATITUDE_INDEX = 6;
const LONGITUDE_INDEX = 7;

const stream = fs.createReadStream('./scripts/cities/french_cities.csv');
let count = 0;
let insertOrUpdate = 0;

stream
  .pipe(csv({ delimiter: ';' }))
  .on('data', async values => {

    count++;
    // Necessary when inserting a lot of datas !
    // https://github.com/C2FO/fast-csv/issues/24
    stream.pause();

    const csvId = +values[ID_INDEX];

    let city = await City.findOne({ csvId });
    if(!city) city = new City();

    city.csvId = csvId;
    city.department = +values[ZIPCODE_INDEX].substr(0, 2);
    city.name = values[NAME_INDEX];
    city.slug = values[SLUG_INDEX];
    city.zipcode = values[ZIPCODE_INDEX];
    city.longitude = parseFloat(values[LONGITUDE_INDEX]);
    city.latitude = parseFloat(values[LATITUDE_INDEX]);

    // Increment and relaunch stream if necessary
    insertOrUpdate++;
    if (insertOrUpdate === count) stream.resume();

    logger.info(`Create or update : ${csvId} => ${city.name}`);
    city.save();
  })
  .on('end', () => {
    // Fixme : ugly force exit...
    setTimeout(() => process.exit(1), 20000);
  });
