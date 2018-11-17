
import { environment } from '../environment';

class StatisticsServiceFactory {

  async getLastStatistics() {
    let url = `${environment.SERVER_URL}${environment.LAST_STATISTICS_URL}`;

    try {
      let response = await fetch(url);
      let statistics = await response.json();
      return statistics;
    } catch(err) {}

    return {};
  }

}

// Export as singleton
const statisticsService = new StatisticsServiceFactory();
Object.freeze(statisticsService);
export { statisticsService as StatisticsService };