import { DATE_HOUR_FORMAT, addWeeksToDate, keepOnlyYearMonthDay } from '../helpers/date.helper';
import dayjs from 'dayjs';

import Statistics from '../models/stat';
import User from '../models/user';
import { DONATION_TYPE, DONATION_STATUS, DONATION_REST_WEEKS, NOTIFICATION_TYPES, GENDER, WOMAN_MAX_BLOOD_DONATION_YEAR } from '../constants';
import Donation from '../models/donation';
import { createNotification } from '../helpers/notification.helper';
import { SlackService } from '../services/slack.service';

/**
 * Compute all users account's statistics
 */
export default class UserStatisticsCron {

  static async run() {
    const startDate = dayjs();
    SlackService.sendCronMessage(`Start UserStatisticsCron at ${startDate.format(DATE_HOUR_FORMAT)}`);

    // Avoid too much request to database by caching objects
    const statObjectCache = {};

    // Get all donations DONE and with statisticsDate in the past
    const donations = await Donation.find({ status: DONATION_STATUS.DONE, statisticsDate: { $lte: new Date() } });
    SlackService.sendCronMessage(`UserStatisticsCron : ${donations.length} donations found`);

    donations.forEach(donation => {
      // Get the day or create it
      const donationDateString = keepOnlyYearMonthDay(donation.finalDate);

      // Get statisticObject in cache or in database or create it
      let dayStat;
      if (statObjectCache[donationDateString]) dayStat = statObjectCache[donationDateString];
      else {
        dayStat = Statistics.findOne({ dayString: keepOnlyYearMonthDay(donation.finalDate) });
        if (!dayStat) {
          statObjectCache[donationDateString] = new Statistics();
          dayStat = statObjectCache[donationDateString];
          dayStat.dayString = donationDateString;
        }
      }

      // Add global + user statistics
      donation.finalAttendees.forEach(attendee => {
        const user = User.findById(attendee.id);
        const isSponsored = user.hasOwnProperty('sponsor');

        user.lastDonationDate = donation.finalDate;
        user.currentDonation = null;

        switch (donation.donationType) {
          case DONATION_TYPE.BLOOD:
            dayStat.dayBloodDonation = dayStat.dayBloodDonation + 1;
            if (isSponsored) dayStat.dayBloodSponsoredDonation = dayStat.dayBloodSponsoredDonation + 1;

            // Update user
            user.bloodDonationDone = user.bloodDonationDone + 1;
            user.lastDonationType = DONATION_TYPE.BLOOD;

            // A woman can only make 4 blood donation
            if(user.gender === GENDER.FEMALE && user.bloodDonationDone === WOMAN_MAX_BLOOD_DONATION_YEAR) {
              // Should wait next year
              const nextYearDate = computNextYearFirstJanuary();
              const nextDonationDate = addWeeksToDate(donation.finalDate, DONATION_REST_WEEKS.BLOOD);

              // Get the later date for minimumDate
              if(nextDonationDate.isAfter(nextYearDate)) user.minimumDate = nextDonation;
              else {
                user.quotaExceeded = true;
                user.minimumDate = nextYearDate;
              }
            } else {
              // MAN or UNKNOWN : no 'really' blood donation limit
              user.minimumDate = addWeeksToDate(donation.finalDate, DONATION_REST_WEEKS.BLOOD);
            }
            break;

          case DONATION_TYPE.PLASMA:
            dayStat.dayPlasmaDonation = dayStat.dayPlasmaDonation + 1;
            user.plasmaDonationDone = user.plasmaDonationDone + 1;
            if (isSponsored) dayStat.dayPlasmaSponsoredDonation = dayStat.dayPlasmaSponsoredDonation + 1;

            // Update user
            user.plasmaDonationDone = user.plasmaDonationDone + 1;
            user.lastDonationType = DONATION_TYPE.PLASMA;
            user.minimumDate = addWeeksToDate(donation.finalDate, DONATION_REST_WEEKS.PLASMA);
            break;

          case DONATION_TYPE.PLATELET:
            dayStat.dayPlateletDonation = dayStat.dayPlateletDonation + 1;
            user.plateletDonationDone = user.plateletDonationDone + 1;
            if (isSponsored) dayStat.dayPlateletSponsoredDonation = dayStat.dayPlateletSponsoredDonation + 1;

            // Update user
            user.plateletDonationDone = user.plateletDonationDone + 1;
            user.lastDonationType = DONATION_TYPE.PLATELET;
            user.minimumDate = addWeeksToDate(donation.finalDate, DONATION_REST_WEEKS.PLATELET);
            break;
        }

        user.save();
      });

      // Make donation as 'treated'
      donation.status = DONATION_STATUS.STATISTICS;
      donation.save();

      // Create ending notification for donation creator
      createNotification({
        name: NOTIFICATION_TYPES.DONATION_STATISTICS,
        forUser: donation.createdBy,
        date: new Date(),
        donationId: donation.id
      });
    });


    // Save all Statistic objects
    Object.keys(statObjectCache).forEach(key => statObjectCache[key].save());

    const endDate = dayjs();
    SlackService.sendCronMessage(`Ended UserStatisticsCron at ${endDate.format(DATE_HOUR_FORMAT)} - Durée : ${endDate.diff(startDate, 'seconds')} secondes`);
  }

}
