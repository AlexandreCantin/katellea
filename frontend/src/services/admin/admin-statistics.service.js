import { getKatelleaTokenHeaders } from '../helper';
import { environment } from '../../environment';

class AdminStatisticsServiceFactory {

  getLastStats() {
    let url = `${environment.SERVER_URL}${environment.ADMIN_LAST_STATISTICS_ENDPOINT}`;
    let headers = getKatelleaTokenHeaders();

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { headers });
      if (response.status === 200) {
        let statsData = await response.json();
        if (statsData) { resolve(statsData); return; }
      }
      reject();
    });
  }

}

// Export as singleton
const adminStatisticsService = new AdminStatisticsServiceFactory();
Object.freeze(adminStatisticsService);
export { adminStatisticsService as AdminStatisticsService };