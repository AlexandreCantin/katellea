import { DATE_HOUR_FORMAT } from '../helpers/date.helper';
import dayjs from 'dayjs';
import { SlackService } from '../services/slack.service';
import User from '../models/user';

/**
 * In this script, we inform a new user that he created a account
*/
export default class NewAnd30DaysWithoutDonationCron {

  static async run() {
    try {
      await NewAnd30DaysWithoutDonationCron.job();
    } catch(err) {
      sendError(err);
    }
  }

  static async job() {
    const startDate = dayjs();

    const users = await User.find({
      $where : "this.createdAt == this.minimumDate",
      currentDonationToken: null,
      quotaExceeded: false,
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
    SlackService.sendCronMessage(`NewAnd30DaysWithoutDonationCron at ${endDate.format(DATE_HOUR_FORMAT)} - Durée : ${endDate.diff(startDate, 'seconds')} secondes`);
  }

}
