import { DATE_HOUR_FORMAT } from '../helpers/date.helper';
import dayjs from 'dayjs';
import User from '../models/user';
import { SlackService } from '../services/slack.service';

/**
In this script, we reset all quota exceeded to false (on 1st January)
*/
export default class QuotaExceededResetCron {

  static async run() {
    const startDate = dayjs();

    const users = await User.find({ 'quotaExceeded': true });

    users.forEach(user => {
      user.quotaExceeded = false;
      user.save();
    });

    const endDate = dayjs();
    SlackService.sendCronMessage(
      `QuotaExceededResetCron at ${endDate.format(DATE_HOUR_FORMAT)} - Durée : ${endDate.diff(startDate, 'seconds')} secondes`
    );
  }

}
