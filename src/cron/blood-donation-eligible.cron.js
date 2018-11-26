import { DATE_HOUR_FORMAT } from '../helpers/date.helper';
import dayjs from 'dayjs';
import User from '../models/user';
import { DONATION_TYPE, NOTIFICATION_TYPES } from '../constants';
import { createNotification } from '../helpers/notification.helper';
import MailFactory from '../services/mail.service';
import { environment } from '../../conf/environment';
import { SlackService } from '../services/slack.service';

const WEEKS_DELAY_BEFORE_ELIGIBILITY = environment.weeksDelayBeforeEligibilty;

/**
In this script, we take all users which have done a blood donation and will be eligible to a new donation in three weeks.
To them, we send a email reminder and create a new notification.
*/
export default class BloodDonationEligibleCron {

  static async run() {
    const startDate = dayjs();
    SlackService.sendMessage(`Start BloodDonationEligibleCron at ${startDate.format(DATE_HOUR_FORMAT)}`);

    const beginPeriodDate = dayjs().set('hour', 0).set('minute', 0).set('second', 0).add(WEEKS_DELAY_BEFORE_ELIGIBILITY, 'week');
    const endPeriodDate = dayjs().set('hour', 23).set('minute', 59).set('second', 59).add(WEEKS_DELAY_BEFORE_ELIGIBILITY, 'week');

    const users = await User.find({
      lastDonationType: DONATION_TYPE.BLOOD,
      lastDonationDate: { $gte: beginPeriodDate.toDate(), $lt: endPeriodDate.toDate() }
    });

    users.forEach(user => {
      // Send email
      try {
        MailFactory.bloodDonationEligibleMail(user);
      } catch (err) {
        SlackService.sendMessage(err);
        return console.error(err);
      }

      // Create notification
      createNotification({
        name: NOTIFICATION_TYPES.ELIGIBLE_TO_NEW_DONATION,
        date: new Date(),
        forUser: user.id,
        data: { minimumDate: user.minimumDate }
      });
    });

    const endDate = dayjs();
    SlackService.sendMessage(`Ended BloodDonationEligibleCron at ${endDate.format(DATE_HOUR_FORMAT)} - Durée : ${endDate.diff(startDate, 'seconds')} secondes`);
  }

}
