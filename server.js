import express from 'express';
import cron from 'node-cron';
import path from 'path';
import cors from 'cors';

import initMongoDB from './src/clients/moongose';

import dayjs from 'dayjs';
import 'dayjs/locale/fr';

import helmet from 'helmet';
import bodyParser from 'body-parser';
import loggingMiddleware from './src/middlewares/logging';
import errorHandler from './src/middlewares/errorHandler';
import passport from 'passport';

import userRoutes from './src/routes/user-routes';
import authRoutes from './src/routes/auth-routes';
import establishmentRoutes from './src/routes/establishment-route';
import donationRoutes from './src/routes/donation-routes';
import statisticsRoutes from './src/routes/stats-routes';
import contactRoutes from './src/routes/contact-routes';
import notificationsRoutes from './src/routes/notifications-route';
import mobileCollectsRoutes from './src/routes/mobile-collects-routes';
import rootRoutes from './src/routes/preact-proxy-routes';

import UserStatisticsCron from './src/cron/user-stats.cron';
import DonationDoneCron from './src/cron/donation-done.cron';
import DonationGlobalStatCron from './src/cron/donation-global-stat.cron';
import BloodDonationEligibleCron from './src/cron/blood-donation-eligible.cron';
import MobileCollectDownloadCron from './src/cron/mobile-collect-download.cron';
import FirstDonationAdviceCron from './src/cron/first-donation-advice.cron';
import { environment } from './conf/environment';

// INIT APP
const app = express();

// Days locale
dayjs.locale('fr');

// Database
initMongoDB();

// CRON JOB
const CRON = environment.cron;
if (CRON.isMainLeader) {
  cron.schedule(CRON.statCRON, () => UserStatisticsCron.run());
  cron.schedule(CRON.globalStatCRON, () => DonationGlobalStatCron.run());
  cron.schedule(CRON.donationDoneCRON, () => DonationDoneCron.run());
  cron.schedule(CRON.bloodDonationEligibleCron, () => BloodDonationEligibleCron.run());
  cron.schedule(CRON.mobileCollectDownloadCron, () => MobileCollectDownloadCron.run());
  cron.schedule(CRON.firstDonationAdviceCron, () => FirstDonationAdviceCron.run());
}


// MIDDLEWARES
// app.use(loggingMiddleware);
app.use(bodyParser.json());
app.use(errorHandler);
app.use(passport.initialize());
if (process.env.NODE_ENV === 'production') app.use(helmet())
if (process.env.NODE_ENV !== 'production') app.use(cors())

// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/src/templates'));


// ROUTES
app.use(authRoutes);
app.use('/user', userRoutes);
app.use('/establishment', establishmentRoutes);
app.use('/mobile-collect', mobileCollectsRoutes);
app.use('/donation', donationRoutes);
app.use('/statistics', statisticsRoutes);
app.use('/notifications', notificationsRoutes);
app.use(contactRoutes);

// Serve preact build : Need to be last !
app.use(express.static('frontend/build'));
app.use(rootRoutes);

// By using (!module.parent) condition, we avoid EADDRINUSE when testing because app will start once
let startApp = process.env.NODE_ENV != 'test';
if (process.env.NODE_ENV == 'test' && !module.parent) startApp = true;

if (startApp) {

  app.listen(3000, () => {
    if (!process.env.NODE_ENV) {
      console.log(`No environment !! Server will not start`);
      process.exit(0);
      return;
    }

    console.log('Listening on port 3000...');
    console.log(`Current environment is => ${process.env.NODE_ENV}`);
  });
}


export default app;
