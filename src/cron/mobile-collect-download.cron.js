import { DATE_HOUR_FORMAT } from '../helpers/date.helper';
import dayjs from 'dayjs';
import http from 'http';
import fs from 'fs';
import MobileCollect from '../models/mobile-collect';
import { SlackService } from '../services/slack.service';
import logger from '../services/logger.service';


const JSON_FOLDER = './src/cron/mobile-collects/';
const JSON_NAME = 'current.json';
const API_URL = 'http://api.openeventdatabase.org/event/?what=health.blood.collect&when=nextweek&limit=1000';
const currentFilePath = `${JSON_FOLDER}${JSON_NAME}`;
const archivePath = `${JSON_FOLDER}${dayjs().format('YYYY_MM_DD')}.json`;

const dirname = './src/cron/mobile-collects';

/**
In this script, we take download - each day - datas from : api.openeventdatabase.org/event/?what=health.blood.collect&when=nextweek&limit=1000
Then we populate the database with the data extracted
*/
export default class MobileCollectDownloadCron {

  static run() {
    const startDate = dayjs();
    SlackService.sendMessage(`Start MobileCollectDownloadCron at ${startDate.format(DATE_HOUR_FORMAT)}`);


    // Create the log directory if it does not exist
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname);
    }

    // 1 - Rename current json file
    if (fs.existsSync(currentFilePath)) fs.renameSync(currentFilePath, archivePath);

    // 2 - Download URL and insert content in current.json
    http.get(API_URL, resp => {
      let data = '';

      // A chunk of data has been recieved.
      resp.on('data', chunk => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on('end', async () => {
        try {
          fs.openSync(currentFilePath, 'w+');
          fs.writeFileSync(currentFilePath, data);
          SlackService.sendMessage(`Fichier : ${currentFilePath} créé - ${dayjs().format('DD/MM/YYYY')}`);

          // Collection of all new mobileCollect
          let mobileCollectCollections = [];
          mobileCollectCollections = computeCollection(currentFilePath, mobileCollectCollections);
          SlackService.sendMessage(`Nombre de collectes mobiles => ${mobileCollectCollections.length}`);

          // Drop collection
          await MobileCollect.deleteMany({});

          // RecreateCollection
          for(let i = 0; i < mobileCollectCollections.length; i++) await mobileCollectCollections[i].save();
        } catch(err) {
          SlackService.sendMessage(err);
          logger.error(err.message);
        }

        writeEndDate(startDate);
      });
    }).on('error', err => {
      SlackService.sendMessage(err);
      logger.error(`Error: ${err.message}`);
      writeEndDate(startDate);
    });
  }

}

const writeEndDate = startDate => {
  const endDate = dayjs();
  SlackService.sendMessage(`Ended MobileCollectDownloadCron at ${endDate.format(DATE_HOUR_FORMAT)} - Durée : ${endDate.diff(startDate, 'seconds')} secondes`);
};

const computeCollection = (currentFilePath, mobileCollectCollections) => {
  const fileContent = JSON.parse(fs.readFileSync(currentFilePath));
  const mobilesCollectsJSON = fileContent.features;

  for(let i = 0; i < mobilesCollectsJSON.length; i++) {
    const collectData = mobilesCollectsJSON[i].properties;

    const mobileCollect = new MobileCollect();
    mobileCollect.longitude = collectData.lon;
    mobileCollect.latitude = collectData.lat;

    const start = collectData.start.substring(0, collectData.start.indexOf('CET'));
    const stop = collectData.stop.substring(0, collectData.stop.indexOf('CET'));
    mobileCollect.beginDate = new Date(start);
    mobileCollect.endDate = new Date(stop);
    mobileCollect.place = collectData.name;
    mobileCollect.city = collectData['where:name'];
    mobileCollect.coordinates = [collectData.lon, collectData.lat];

    mobileCollectCollections.push(mobileCollect);
  }

  return mobileCollectCollections;
};
