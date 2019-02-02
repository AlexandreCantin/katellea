import { DATE_HOUR_FORMAT } from '../helpers/date.helper';
import dayjs from 'dayjs';
import { environment } from '../../conf/environment';

import { DONATION_STATUS, DONATION_EVENTS, NOTIFICATION_TYPES } from '../constants';
import Donation from '../models/donation';
import { createNotification } from '../helpers/notification.helper';
import { SlackService } from '../services/slack.service';
import MailFactory from '../services/mail.service';


/**
 * In this script, we take all the donation with the status DATE_CONFIRMED and definitive_date < current date.
 * For all these values, we update the status to DONE and indicate when to use for statistics
*/
export default class DonationDoneCron {

  static async run() {
    const startDate = dayjs();

    const statisticsDate = dayjs().add(environment.daysBeforeStatisticsAnalytics, 'day');
    const donations = await Donation.find({ status: DONATION_STATUS.DATE_CONFIRMED, finalDate: { $lte: new Date() } });

    donations.forEach(donation => {
      donation.status = DONATION_STATUS.DONE;
      donation.statisticsDate = statisticsDate;
      donation.events.push({ name: DONATION_EVENTS.DONE, author: 0, username: donation.createdByGuest.name, date: new Date(), data: { statisticsDate: statisticsDate.toDate() } });

      // Create ending notification for donation creator
      if(donation.isPublicDonation) MailFactory.sendDonationDone(donation.createdByGuest.name, donation.createdByGuest.email, donation);
      else {
        createNotification({
          name: NOTIFICATION_TYPES.DONATION_DONE,
          forUser: donation.createdBy,
          date: new Date(),
          donationId: donation.id,
          data: { statisticsDate: statisticsDate.toDate() }
        });
      }
    });

    const endDate = dayjs();
    SlackService.sendCronMessage(`DonationDoneCron at ${endDate.format(DATE_HOUR_FORMAT)} - Durée : ${endDate.diff(startDate, 'seconds')} secondes`);
  }

}
