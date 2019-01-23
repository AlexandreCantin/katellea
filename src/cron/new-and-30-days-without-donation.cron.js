import { DATE_HOUR_FORMAT } from '../helpers/date.helper';
import dayjs from 'dayjs';
import { SlackService } from '../services/slack.service';
import User from '../models/user';

/**
 * In this script, we inform a new user that he created a account
*/
export default class NewAnd30DaysWithoutDonationCron {

  static async run() {
    const startDate = dayjs();

    let begin = dayjs().subtract(30, 'day').startOf('day');
    let end = dayjs().subtract(30, 'day').endOf('day');

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
    SlackService.sendCronMessage(`NewAnd30DaysWithoutDonationCron at ${endDate.format(DATE_HOUR_FORMAT)} - Durée : ${endDate.diff(startDate, 'seconds')} secondes`);
  }

}
