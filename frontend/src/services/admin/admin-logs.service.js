import { getKatelleaTokenHeaders } from '../helper';
import { environment } from '../../environment';

class AdminLogsServiceFactory {

  getAllLogs({ page, pageSize }) {
    let url = `${environment.SERVER_URL}${environment.ADMIN_LOGS_ENDPOINT}?page=${page}&pageSize=${pageSize}`;
    return this.doRequest(url);
  }

  getTotalLogsNumber() {
    let url = `${environment.SERVER_URL}${environment.ADMIN_USER_TOTAL_ENDPOINT}`;
    return this.doRequest(url);
  }

  getUserLogs(userId) {
    let url = `${environment.SERVER_URL}${environment.ADMIN_USER_LOGS_ENDPOINT}${userId}`;
    return this.doRequest(url);
  }

  getAllAdmins() {
    let url = `${environment.SERVER_URL}${environment.ADMIN_USER_LOGS_ENDPOINT}`;
    return this.doRequest(url);
  }

  getLastLog() {
    let url = `${environment.SERVER_URL}${environment.ADMIN_LAST_USER_LOG_ENDPOINT}`;
    return this.doRequest(url);
  }

  doRequest(url) {
    let headers = getKatelleaTokenHeaders();

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { headers });
      if (response.status === 200) {
        let usersData = await response.json();
        if (usersData) { resolve(usersData); return; }
      }
      reject();
    });
  }

}

// Export as singleton
const adminLogsService = new AdminLogsServiceFactory();
Object.freeze(adminLogsService);
export { adminLogsService as AdminLogsService };