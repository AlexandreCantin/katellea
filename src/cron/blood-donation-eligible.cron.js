import dayjs from 'dayjs';

import { DATE_HOUR_FORMAT } from '../helpers/date.helper';
import User from '../models/user';
import { DONATION_TYPE, NOTIFICATION_TYPES } from '../constants';
import { createNotification } from '../helpers/notification.helper';
import MailFactory from '../services/mail.service';
import { environment } from '../../conf/environment';
import { SlackService } from '../services/slack.service';
import { sendError } from '../helper';
import { DONATION_REST_WEEKS } from '../../frontend/src/enum';
import Donation from '../models/donation';

const WEEKS_DELAY_BEFORE_ELIGIBILITY = environment.weeksDelayBeforeEligibilty;

/**
In this script, we take all users which have done a blood donation and will be eligible to a new donation in three weeks.
To them, we send a email reminder and create a new notification.
*/
export default class BloodDonationEligibleCron {

  static async run() {
    try {
      await BloodDonationEligibleCron.job();
    } catch(err) {
      sendError(err);
    }
  }

  static async job() {
    const startDate = dayjs();

    let beginPeriodDate = dayjs().set('hour', 0).set('minute', 0).set('second', 0).add(WEEKS_DELAY_BEFORE_ELIGIBILITY, 'week');
    let endPeriodDate = dayjs().set('hour', 23).set('minute', 59).set('second', 59).add(WEEKS_DELAY_BEFORE_ELIGIBILITY, 'week');

    // USERS
    const users = await User.find({
      lastDonationType: DONATION_TYPE.BLOOD,
      lastDonationDate: { $gte: beginPeriodDate.toDate(), $lt: endPeriodDate.toDate() }
    });

    users.forEach(user => {
      // Send email
      try {
        MailFactory.bloodDonationEligibleMail(user);
      } catch (err) {
        sendError(err);
        return;
      }

      // Create notification
      createNotification({
        name: NOTIFICATION_TYPES.ELIGIBLE_TO_NEW_DONATION,
        date: new Date(),
        forUser: user.id,
        data: { minimumDate: user.minimumDate }
      });
    });

    // PUBLIC DONATION => Donation done 7 weeks ago
    const WEEK_DELTA = DONATION_REST_WEEKS - WEEKS_DELAY_BEFORE_ELIGIBILITY;
    beginPeriodDate = dayjs().set('hour', 0).set('minute', 0).set('second', 0).subtract(WEEK_DELTA, 'week');;
    endPeriodDate = dayjs().set('hour', 0).set('minute', 0).set('second', 0).subtract(WEEK_DELTA, 'week');;

    const donations = await Donation.find({
      lastDonationDate: { $gte: beginPeriodDate.toDate(), $lt: endPeriodDate.toDate() },
      acceptEligibleMail: true,
      isPublicDonation: true,
    });

    donations.forEach(donation => {
      // Send email
      try {
        MailFactory.bloodDonationEligibleGuestAdmin(donation.createdByGuest.name, donation.createdByGuest.email, donation);
      } catch (err) {
        sendError(err);
        return;
      }
    });

    const endDate = dayjs();
    SlackService.sendCronMessage(
      `BloodDonationEligibleCron at ${endDate.format(DATE_HOUR_FORMAT)} - Durée : ${endDate.diff(startDate, 'seconds')} secondes`
    );
  }

}
