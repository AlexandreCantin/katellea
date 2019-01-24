import { DATE_HOUR_FORMAT } from '../helpers/date.helper';
import dayjs from 'dayjs';
import { SlackService } from '../services/slack.service';
import User from '../models/user';


/**
 * In this script, we inform user that he is available to a new donation (15/30/90 days)
*/
export default class DonationReminderCron {

  static async run() {
    const startDate = dayjs();


    [15,30,90].forEach(dayToSubtract => DonationReminderCron.notifyUsers(dayToSubtract));

    const endDate = dayjs();
    SlackService.sendCronMessage(`DonationDoneCron at ${endDate.format(DATE_HOUR_FORMAT)} - Durée : ${endDate.diff(startDate, 'seconds')} secondes`);
  }

  static async notifyUsers(dayNbToSubtract) {
    let begin = dayjs().subtract(dayNbToSubtract, 'day').startOf('day');
    let end = dayjs().subtract(dayNbToSubtract, 'day').endOf('day');

    const users = await User.find({
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
