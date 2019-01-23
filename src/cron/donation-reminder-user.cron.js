import { DATE_HOUR_FORMAT } from '../helpers/date.helper';
import dayjs from 'dayjs';
import { DONATION_STATUS, DONATION_EVENTS, NOTIFICATION_TYPES } from '../constants';
import Donation from '../models/donation';
import { createNotification } from '../helpers/notification.helper';
import { environment } from '../../conf/environment';
import { SlackService } from '../services/slack.service';
import User from '../models/user';


/**
 * In this script, we inform user that he is available to a new donation (15/30/90 days)
*/
export default class DonationReminderCron {

  static async run() {
    const startDate = dayjs();
    SlackService.sendCronMessage(`Start DonationReminderCron at ${startDate.format(DATE_HOUR_FORMAT)}`);


    [15,30,90].forEach(dayToSubtract => notifyUsers(dayToSubtract));

    const endDate = dayjs();
    SlackService.sendCronMessage(`Ended DonationDoneCron at ${endDate.format(DATE_HOUR_FORMAT)} - Durée : ${endDate.diff(startDate, 'seconds')} secondes`);
  }

  notifyUser(dayNbToSubtract) {
    let begin = dayjs().subtract(dayNbToSubtract, 'day').startOf('day');
    let end = dayjs().subtract(dayNbToSubtract, 'day').endOf('day');

    const users = User.find({
      minimumDate: { $gte: begin.toDate(), $lt: end.toDate() },
      lastDonationDate: { $ne: null },
      quotaExceeded: false
    });

    users.forEach(user => {
      // Send email
      try {
        MailFactory.availableToNewDonationReminder(user, dayNbToSubtract);
      } catch (err) {
        sendError(err);
        return;
      }
    })
  }

}
