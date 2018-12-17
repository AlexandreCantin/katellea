import dayjs from 'dayjs';
import ejs from 'ejs';
import pdf from 'html-pdf';
import fs from 'fs';
import * as Sentry from '@sentry/node';

import { SlackService } from '../services/slack.service';

import { GRPD_EXPORT_STATUS, DONATION_STATUS } from '../constants';
import { DATE_HOUR_FORMAT, dateFormatDayMonthYear, dateFormatDayMonthYearHourMinutSecond } from '../helpers/date.helper';
import GRPDExport from '../models/grpd-export';
import User from '../models/user';
import Donation from '../models/donation';
import Establishment from '../models/establishment';
import logger from '../services/logger.service';
import { environment } from '../../conf/environment';
import MailFactory from '../services/mail.service';

const DIRNAME = './src/pdf';

/**
  In this script, we take all users that exported data and create PDF with all user data
*/
export default class GRPDExportCron {

  static async keepOnlyUserData(userId, donation) {

    donation.pollAnswers = donation.pollAnswers.filter(pa => pa.author === userId);
    donation.events = donation.events.filter(ev => ev.author === userId);
    donation.finalAttendees = donation.finalAttendees.filter(faId => faId === userId);

    // Populate author and establishment
    donation.createdBy = await User.findById(userId);
    if(donation.establishment) donation.establishment = await Establishment.findById(donation.establishment);
    return donation;
  }

  static async run() {
    const startDate = dayjs();
    SlackService.sendCronMessage(`Start GRPDExportCron at ${startDate.format(DATE_HOUR_FORMAT)}`);

    // Create PDF folder if not exists
    if (!fs.existsSync(DIRNAME)) fs.mkdirSync(DIRNAME);

    // Get all GRPDExport
    const grpdDemands = await GRPDExport.find({ status: GRPD_EXPORT_STATUS.ASKED });
    SlackService.sendCronMessage(`${grpdDemands} demandes d'export`);

    grpdDemands.forEach(async grpdDemand => {
      // 1 - Get datas
      const userId = grpdDemand.user;

      //  1.1 - User data
      const user = await User.findById(userId)
        .populate({ path: 'establishment', model: 'Establishment' })
        .populate({ path: 'sponsor', model: 'User', select: User.publicFields })
        .populate({ path: 'currentDonation', model: 'Donation' });

      // Is user still exists ?
      if (user.email !== '') {

        if(user.currentDonation) user.currentDonation = await GRPDExportCron.keepOnlyUserData(userId, user.currentDonation);

        //  1.2 - Donations data
        const donationsHistory = await Donation.find({
          status: { $in: [DONATION_STATUS.DONE, DONATION_STATUS.STATISTICS] },
          finalAttendees: userId
        });
        donationsHistory.map(async donation => await GRPDExportCron.keepOnlyUserData(userId, donation));

        // TODO: missing donation with only pollAnswers and events

        //  1.3 - GRPD Export
        const userGrpdExports = await GRPDExport.find({ user: userId });

        // Create html content ans PDF file
        try {

          const htmlContent = await ejs.renderFile('./src/templates/grpd/grpd-export.ejs', {
            user,
            donationsHistory,
            userGrpdExports,
            dateFormatDayMonthYear: dateFormatDayMonthYear,
            dateFormatDayMonthYearHourMinutSecond: dateFormatDayMonthYearHourMinutSecond,
          });


          const filename = `${DIRNAME}/${grpdDemand.token}.pdf`;
          pdf.create(htmlContent).toFile(filename, function(err, res) {
            if(err) throw err;
          });

        } catch(err) {
          Sentry.captureException(err);
          logger.error(err);
          return;
        }

        // Set as DONE
        try {
          grpdDemand.status = GRPD_EXPORT_STATUS.CANCELED;
          await GRPDExport.findOneAndUpdate({ _id: grpdDemand.id }, grpdDemand);
        } catch (err) {
          Sentry.captureException(err);
          logger.error(err);
        }

        // Send mail with link
        const url = `${environment.baseUrl}/grpd/pdf/${grpdDemand.token}`;
        MailFactory.sendGRPDMail(user, url);
      }

    });


    const endDate = dayjs();
    SlackService.sendCronMessage(
      `Ended GRPDExportCron at ${endDate.format(DATE_HOUR_FORMAT)} - Durée : ${endDate.diff(startDate, 'seconds')} secondes`
    );
  }

}
