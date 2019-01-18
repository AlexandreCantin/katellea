import fs from 'fs';
import mongoose from 'mongoose';
import { Parser } from 'xml2js';

import { environment } from '../../conf/environment';
import Establishment from '../../src/models/establishment';
import logger from '../../src/services/logger.service';

// Database connection
const database = environment.database;
const mongoUrl = process.env.MONGO_URL || `mongodb://${database.username}:${database.password}@${database.host}:${database.port}/${database.name}`;
mongoose.connect(mongoUrl, { useNewUrlParser: true });


const parser = new Parser();
fs.readFile('./scripts/establishments/efs_establishments.xml', async (err, data) => {
  parser.parseString(data, (err, root) => {

    root.establishments.establishment.forEach(async (es, index) => {
      const donationsAvailable = es['donations-available'][0];
      const openingHours = es['opening-hours'][0];
      const coordinates = es['coordinates'][0];

      // Update or create
      let establishment = await Establishment.findOne({ name: es.name[0] });
      if (!establishment) establishment = new Establishment();

      establishment.name = es.name[0];
      establishment.address = es.address[0];
      establishment.zipcode = es.zipcode[0];

      establishment.phone = es['contact'][0].phone[0];
      establishment.email = es['contact'][0].email[0];

      establishment.bloodAvailable = donationsAvailable.blood[0]['$'].available === 'true';
      establishment.bloodAppointement = donationsAvailable.blood[0]['$'].appointement === 'true';
      establishment.plasmaAvailable = donationsAvailable.plasma[0]['$'].available === 'true';
      establishment.plasmaAppointement = donationsAvailable.plasma[0]['$'].appointement === 'true';
      establishment.plateletAvailable = donationsAvailable.platelet[0]['$'].available === 'true';
      establishment.plateletAppointement = donationsAvailable.platelet[0]['$'].appointement === 'true';
      establishment.boneMarrowAvailable = donationsAvailable['bone-marrow'][0]['$'].available === 'true';
      establishment.boneMarrowAppointement = donationsAvailable['bone-marrow'][0]['$'].appointement === 'true';

      establishment.mondayHours = openingHours.monday[0];
      establishment.tuesdayHours = openingHours.tuesday[0];
      establishment.wenesdayHours = openingHours.wenesday[0];
      establishment.thursdayHours = openingHours.thursday[0];
      establishment.fridayHours = openingHours.friday[0];
      establishment.sathurdayHours = openingHours.sathurday[0];

      establishment.longitude = parseFloat(coordinates.longitude[0]);
      establishment.latitude = parseFloat(coordinates.latitude[0]);
      establishment.coordinates = [establishment.longitude, establishment.latitude];

      establishment.efsComment = es.comment ? es.comment[0] : '';

      logger.info(`Create or update : ${establishment.name}`);
      establishment.save();

      // Force exit on finish
      if (index + 1, root.establishments.establishment.length) {
        setTimeout(() => process.exit(1), 1000);
      }

    });
  });
});
