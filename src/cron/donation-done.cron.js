import { DATE_HOUR_FORMAT } from '../helpers/date.helper';
import dayjs from 'dayjs';
import { DONATION_STATUS, DONATION_EVENTS, NOTIFICATION_TYPES } from '../constants';
import Donation from '../models/donation';
import { createNotification } from '../helpers/notification.helper';
import { environment } from '../../conf/environment';
import { SlackService } from '../services/slack.service';


/**
 * In this script, we take all the donation with the status DATE_CONFIRMED and definitive_date < current date.
 * For all these values, we update the status to DONE and indicate when to use for statistics
*/
export default class DonationDoneCron {

  static async run() {
    const startDate = dayjs();
    SlackService.sendMessage(`Start DonationDoneCron at ${startDate.format(DATE_HOUR_FORMAT)}`);

    const statisticsDate = dayjs().add(environment.daysBeforeStatisticsAnalytics, 'day');
    const donations = await Donation.find({ status: DONATION_STATUS.DATE_CONFIRMED, finalDate: { $lte: new Date() } });

    donations.forEach(donation => {
      donation.status = DONATION_STATUS.DONE;
      donation.statisticsDate = statisticsDate;
      donation.events.push({ name: DONATION_EVENTS.DONE, author: 0, date: new Date(), data: { statisticsDate: statisticsDate.toDate() } });

      // Create ending notification for donation creator
      createNotification({
        name: NOTIFICATION_TYPES.DONATION_DONE,
        forUser: donation.createdBy,
        date: new Date(),
        donationId: donation.id,
        data: { statisticsDate: statisticsDate.toDate() }
      });
    });

    const endDate = dayjs();
    SlackService.sendMessage(`Ended DonationDoneCron at ${endDate.format(DATE_HOUR_FORMAT)} - Durée : ${endDate.diff(startDate, 'seconds')} secondes`);
  }

}
