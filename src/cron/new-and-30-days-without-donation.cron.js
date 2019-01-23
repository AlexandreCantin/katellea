import { DATE_HOUR_FORMAT } from '../helpers/date.helper';
import dayjs from 'dayjs';
import { DONATION_STATUS, DONATION_EVENTS, NOTIFICATION_TYPES } from '../constants';
import Donation from '../models/donation';
import { createNotification } from '../helpers/notification.helper';
import { environment } from '../../conf/environment';
import { SlackService } from '../services/slack.service';
import User from '../models/user';

/**
 * In this script, we inform a new user that he created a account
*/
export default class NewAnd30DaysWithoutDonationCron {

  static async run() {
    const startDate = dayjs();
    SlackService.sendCronMessage(`Start NewAnd30DaysWithoutDonationCron at ${startDate.format(DATE_HOUR_FORMAT)}`);

    let begin = dayjs().subtract(dayNbToSubtract, 'day').startOf('day');
    let end = dayjs().subtract(dayNbToSubtract, 'day').endOf('day');

    const users = User.find({
      $where : "this.createdAt == this.minimumDate",
      currentDonation: null,
      quotaExceeded: false
    });


    users.forEach(user => {
      try {
        MailFactory.newAnd30DaysWithoutDonationMail(user);
      } catch (err) {
        sendError(err);
        return;
      }
    });

    const endDate = dayjs();
    SlackService.sendCronMessage(`Ended NewAnd30DaysWithoutDonationCron at ${endDate.format(DATE_HOUR_FORMAT)} - Durée : ${endDate.diff(startDate, 'seconds')} secondes`);
  }

}
