import express from 'express';
import cron from 'node-cron';
import path from 'path';
import cors from 'cors';
import 'express-async-errors';
import * as Sentry from '@sentry/node';



import initMongoDB from './src/clients/moongose';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

import helmet from 'helmet';
import bodyParser from 'body-parser';
import errorHandler from './src/middlewares/errorHandler';
import passport from 'passport';

import logger from './src/services/logger.service';

import userRoutes from './src/routes/user-routes';
import authRoutes from './src/routes/auth-routes';
import establishmentRoutes from './src/routes/establishment-route';
import donationRoutes from './src/routes/donation-routes';
import statisticsRoutes from './src/routes/public-stats-routes';
import contactRoutes from './src/routes/contact-routes';
import notificationsRoutes from './src/routes/notifications-route';
import mobileCollectsRoutes from './src/routes/mobile-collects-routes';
import rootRoutes from './src/routes/react-proxy-routes';
import grpdRoutes from './src/routes/grpd-routes';
import adminStatisticsRoutes from './src/routes/admin/admin-statistics-route';
import adminUsersRoutes from './src/routes/admin/admin-users-route';
import adminCityEstablishmentRoutes from './src/routes/admin/admin-city-establishment-route';
import adminLogsRoutes from './src/routes/admin/admin-logs-route';

import UserStatisticsCron from './src/cron/user-stats.cron';
import DonationDoneCron from './src/cron/donation-done.cron';
import GlobalStatCron from './src/cron/global-stat.cron';
import BloodDonationEligibleCron from './src/cron/blood-donation-eligible.cron';
import MobileCollectDownloadCron from './src/cron/mobile-collect-download.cron';
import FirstDonationAdviceCron from './src/cron/first-donation-advice.cron';
import QuotaExceededResetCron from './src/cron/quota-exceeded.cron';
import GRPDExportCron from './src/cron/grpd-export.cron';
import NewAnd30DaysWithoutDonationCron from './src/cron/new-and-30-days-without-donation.cron';
import DonationReminderCron from './src/cron/donation-reminder-user.cron';

import { environment } from './conf/environment';

// INIT APP
const app = express();

// SENTRY
const dsn = environment.sentry.dsn;
if (dsn && dsn !== '') Sentry.init({ dsn });

// Days locale
dayjs.locale('fr');

// Database
initMongoDB();

// CRON JOB
const CRON = environment.cron;
if (CRON.isMainLeader) {
  cron.schedule(CRON.statCRON, () => UserStatisticsCron.run());
  cron.schedule(CRON.globalStatCRON, () => GlobalStatCron.run());
  cron.schedule(CRON.donationDoneCRON, () => DonationDoneCron.run());
  cron.schedule(CRON.bloodDonationEligibleCron, () => BloodDonationEligibleCron.run());
  cron.schedule(CRON.mobileCollectDownloadCron, () => MobileCollectDownloadCron.run());
  cron.schedule(CRON.firstDonationAdviceCron, () => FirstDonationAdviceCron.run());
  cron.schedule(CRON.grpdExportCron, () => GRPDExportCron.run());
  cron.schedule(CRON.quotaExceededResetCron, () => QuotaExceededResetCron.run());
  cron.schedule(CRON.newAnd30DaysWithoutDonationCron, () => NewAnd30DaysWithoutDonationCron.run());
  cron.schedule(CRON.donationReminderCron, () => DonationReminderCron.run());
}

// MIDDLEWARES
// app.use(loggingMiddleware);
app.use(bodyParser.json());
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
app.use('/grpd', grpdRoutes);
app.use(contactRoutes);
// Admin
app.use('/admin/statistics', adminStatisticsRoutes);
app.use('/admin/users', adminUsersRoutes);
app.use('/admin/logs', adminLogsRoutes);
app.use('/admin/city-establishment', adminCityEstablishmentRoutes);

// Serve React build : Need to be last !
app.use(express.static('frontend/build'));
app.use(rootRoutes);

// Error handler
app.use(errorHandler);


// By using (!module.parent) condition, we avoid EADDRINUSE when testing because app will start once
let startApp = process.env.NODE_ENV != 'test';
if (process.env.NODE_ENV == 'test' && !module.parent) startApp = true;

if (startApp) {

  app.listen(3000, () => {
    if (!process.env.NODE_ENV) {
      logger.error(`> No environment !! Server will not start`);
      process.exit(0);
      return;
    }

    logger.info('> Listening on port 3000...');
    logger.info(`> Current environment is => ${process.env.NODE_ENV}`);
  });
}


export default app;
