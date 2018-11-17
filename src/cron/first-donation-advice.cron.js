import { DATE_HOUR_FORMAT } from '../helpers/date.helper';
import dayjs from 'dayjs';
import User from '../models/user';
import { createNotification } from '../helpers/notification.helper';
import { NOTIFICATION_TYPES } from '../constants';
import MailFactory from '../services/email/donation-attendees';

const DELAY_BEFORE_DONATION_IN_DAYS = 2;

/**
In this script, we take all users that will do their first donation in two days to send them a reminder to bring their identy card with them
*/
export default class FirstDonationAdviceCron {

  static async run() {
    const startDate = dayjs();
    console.log(`Start FirstDonatioAdviceCron at ${startDate.format(DATE_HOUR_FORMAT)}`);

    // In xx days
    const beginPeriodDate = dayjs().set('hour', 0).set('minute', 0).set('second', 0).add(DELAY_BEFORE_DONATION_IN_DAYS, 'day');
    const endPeriodDate = dayjs().set('hour', 23).set('minute', 59).set('second', 59).add(DELAY_BEFORE_DONATION_IN_DAYS, 'day');

    const users = await User.find({
      'lastDonationDate': { $exists: false },
      'currentDonation': { $exists: true },
      'currentDonation.finalDate': { $gte: beginPeriodDate.toDate(), $lte: endPeriodDate.toDate() }
    }).populate({ path: 'currentDonation', select: 'Donation' });

    users.forEach(user => {
      MailFactory.firstDonationReminder(user);
      createNotification({ name: NOTIFICATION_TYPES.FIRST_DONATION_REMINDER, date: new Date(), forUser: user.id });
    });

    const endDate = dayjs();
    console.log(`Ended FirstDonatioAdviceCron at ${endDate.format(DATE_HOUR_FORMAT)} - Durée : ${endDate.diff(startDate, 'seconds')} secondes`);
  }

}
