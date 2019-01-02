import { DATE_HOUR_FORMAT, keepOnlyYearMonthDay } from '../helpers/date.helper';
import dayjs from 'dayjs';
import Statistics from '../models/stat';
import User from '../models/user';
import { SlackService } from '../services/slack.service';

const DELTA_DAYS = 30;

/**
In this script, we take the DayStatistics from 30 days - or the oldest one - and consolidate all the values.
We assume that the oldest values has correct values.
*/
export default class DonationGlobalStatCron {

  static async run() {
    const startDate = dayjs();
    SlackService.sendCronMessage(`Start DonationGlobalStatCron at ${startDate.format(DATE_HOUR_FORMAT)}`);

    // In this script, we assume taht we already have stats object in database.
    // But we need to create automatically the first one
    DonationGlobalStatCron.createFirstStatIfNeeded();

    // Compute days
    const maxDate = dayjs().subtract(DELTA_DAYS, 'day');

    // Get all the donation in the last XXX days
    const stats = await Statistics.find({ createdAt: { $gte: maxDate.toDate() } }).sort({ createdAt: +1 });

    // Oldest value as reference
    const baseStat = stats[0];
    let baseNbUsers = baseStat !== undefined ? baseStat.nbUsers : 0;
    let baseNbSponsoredUsers = baseStat !== undefined ? baseStat.nbSponsoredUsers : 0;
    let dayBloodDonationBase = baseStat !== undefined ? baseStat.bloodDonation : 0;
    let dayPlasmaDonationBase = baseStat !== undefined ? baseStat.plasmaDonation : 0;
    let dayPlateletDonationBase = baseStat !== undefined ? baseStat.plateletDonation : 0;
    let dayBloodSponsoredDonationBase = baseStat !== undefined ? baseStat.bloodSponsoredDonation : 0;
    let dayPlasmaSponsoredDonationBase = baseStat !== undefined ? baseStat.plasmaSponsoredDonation : 0;
    let dayPlateletSponsoredDonationBase = baseStat !== undefined ? baseStat.plateletSponsoredDonation : 0;

    stats.forEach(async (stat, index) => {
      if(index === 0) return;

      // Get number of user creation
      const beginDate = dayjs(stat.dayString).set('hour', 0).set('minute', 0).set('second', 0);
      const endDate = dayjs(stat.dayString).set('hour', 23).set('minute', 59).set('second', 59);
      const usersLength = await User.countDocuments({ createdAt: { $gte: beginDate.date(), $lt: endDate.date() } });
      baseNbUsers += usersLength;

      // Get number of sponsored user creation
      const sponsoredUsersLength = await User.countDocuments({
        createdAt: { $gte: beginDate.date(), $lt: endDate.date() },
        sponsor: { $exists: true }
      });
      baseNbSponsoredUsers += sponsoredUsersLength;

      // Increments values
      dayBloodDonationBase += stat.dayBloodDonation;
      dayPlasmaDonationBase += stat.dayPlasmaDonation;
      dayPlateletDonationBase += stat.dayPlateletDonation;
      dayBloodSponsoredDonationBase += stat.dayBloodSponsoredDonation;
      dayPlasmaSponsoredDonationBase += stat.dayPlasmaSponsoredDonation;
      dayPlateletSponsoredDonationBase += stat.dayPlateletSponsoredDonation;

      // Update values
      stat.nbUsers = baseNbUsers;
      stat.nbSponsoredUsers = baseNbSponsoredUsers;
      stat.dayNbUsers = usersLength;
      stat.dayNbSponsoredUsers = sponsoredUsersLength;

      stat.bloodDonation = dayBloodDonationBase;
      stat.plasmaDonation = dayPlasmaDonationBase;
      stat.plateletDonation = dayPlateletDonationBase;
      stat.bloodSponsoredDonation = dayBloodSponsoredDonationBase;
      stat.plasmaSponsoredDonation = dayPlasmaSponsoredDonationBase;
      stat.plateletSponsoredDonation = dayPlateletSponsoredDonationBase;

      stat.save();
    });

    const endDate = dayjs();
    SlackService.sendCronMessage(`Ended DonationGlobalStatCron at ${endDate.format(DATE_HOUR_FORMAT)} - Durée : ${endDate.diff(startDate, 'seconds')} secondes`);
  }


  static async createFirstStatIfNeeded() {
    const statsCount = await Statistics.countDocuments({});
    if(statsCount !== 0) return;

    // Create first stat object
    const firstStat = new Statistics();
    firstStat.dayString = keepOnlyYearMonthDay(new Date());

    // Get number of users
    const allUsersCount = await User.countDocuments({});
    firstStat.nbUsers = allUsersCount;

    // Get number of users with sponsor
    const allSponsoredUsersCount = await User.countDocuments({ sponsor: { $exists: true } });
    firstStat.nbSponsoredUsers = allSponsoredUsersCount;

    // Get number of user creation
    const beginDate = dayjs().set('hour', 0).set('minute', 0).set('second', 0);
    const endDate = dayjs().set('hour', 23).set('minute', 59).set('second', 59);
    const usersCreatedCount = await User.countDocuments({ createdAt: { $gte: beginDate.date(), $lt: endDate.date() } });
    firstStat.dayNbUsers = usersCreatedCount;

    // Get number of sponsor user creation
    const sponsoredUsersCreatedCount = await User.countDocuments({ createdAt: { $gte: beginDate.date(), $lt: endDate.date() }, sponsor: { $exists: true } });
    firstStat.dayNbSponsoredUsers = sponsoredUsersCreatedCount;

    firstStat.bloodDonation = 0;
    firstStat.plasmaDonation = 0;
    firstStat.plateletDonation = 0;
    firstStat.bloodSponsoredDonation = 0;
    firstStat.plasmaSponsoredDonation = 0;
    firstStat.plateletSponsoredDonation = 0;

    firstStat.dayBloodDonation = 0;
    firstStat.dayPlasmaDonation = 0;
    firstStat.dayPlateletDonation = 0;
    firstStat.dayBloodSponsoredDonation = 0;
    firstStat.dayPlasmaSponsoredDonation = 0;
    firstStat.dayPlateletSponsoredDonation = 0;

    firstStat.save();
  }

}
