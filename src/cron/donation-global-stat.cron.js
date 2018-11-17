import { DATE_HOUR_FORMAT } from '../helpers/date.helper';
import dayjs from 'dayjs';
import Statistics from '../models/stat';
import User from '../models/user';

const DELTA_DAYS = 30;

/**
In this script, we take the DayStatistics from 30 days - or the oldest one - and consolidate all the values.
We assume that the oldest values has correct values.
*/
export default class DonationGlobalStatCron {

  static async run() {
    const startDate = dayjs();
    console.log(`Start DonationGlobalStatCron at ${startDate.format(DATE_HOUR_FORMAT)}`);

    // Compute days
    const maxDate = dayjs().subtract(DELTA_DAYS, 'day');

    // Get all the donation in the last XXX days
    const stats = await Statistics.find({ createdAt: { $lte: maxDate } }).sort({ createdAt: -1 });

    // Oldest value as reference
    const baseStat = stats[0];
    let baseNbUsers = baseStat !== undefined ? baseStat.nbUser : 0;
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
      const users = await User.find({ createdAt: { $gte: beginDate.date(), $lt: endDate.date() } });
      baseNbUsers += users.length;

      // Increments values
      dayBloodDonationBase += stat.dayBloodDonationBase;
      dayPlasmaDonationBase += stat.dayPlasmaDonationBase;
      dayPlateletDonationBase += stat.dayPlateletDonationBase;
      dayBloodSponsoredDonationBase += stat.dayBloodSponsoredDonationBase;
      dayPlasmaSponsoredDonationBase += stat.dayPlasmaSponsoredDonationBase;
      dayPlateletSponsoredDonationBase += stat.dayPlateletSponsoredDonationBase;

      // Update values
      stat.nbUsers = baseNbUsers;
      stat.dayNbUsers = users.length;
      stat.bloodDonation = dayBloodDonationBase;
      stat.plasmaDonation = dayPlasmaDonationBase;
      stat.plateletDonation = dayPlateletDonationBase;
      stat.bloodSponsoredDonation = dayBloodSponsoredDonationBase;
      stat.plasmaSponsoredDonation = dayPlasmaSponsoredDonationBase;
      stat.plateletSponsoredDonation = dayPlateletSponsoredDonationBase;
      stat.save();
    });

    const endDate = dayjs();
    console.log(`Ended DonationGlobalStatCron at ${endDate.format(DATE_HOUR_FORMAT)} - Durée : ${endDate.diff(startDate, 'seconds')} secondes`);
  }

}
