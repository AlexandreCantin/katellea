import dayjs from 'dayjs';

import AdminLog from '../models/admin-log';
import { sendError } from '../helper';

/*
 * Service related to interaction with social networks
 */
export default class AdminLogServiceFactory {

  async createLog(user) {
    // Looking for log during the last 30 minutes
    const now = dayjs();
    const maxDate = dayjs().subtract(30, 'minute');
    const log = await AdminLog.findOne({
      $and: [
        { updatedAt: { $gte: maxDate.toDate(), $lte: now.toDate() }},
        { user: user.id }
      ]
    });

    if(log) {
      // Simply update updatedAt date
      try {
        log.updatedAt = dayjs().toISOString();
        log.save();
      } catch(err) {
        sendError(err);
      }
      return;
    }

    // Not log found, create new one !
    try {
      const log = new AdminLog();
      log.user = user.id;
      log.save();
    } catch(err) {
      sendError(err);
    }
  }
}

// Export as singleton
const adminLogServiceFactory = new AdminLogServiceFactory();
Object.freeze(adminLogServiceFactory);
export { adminLogServiceFactory as AdminLogService };
