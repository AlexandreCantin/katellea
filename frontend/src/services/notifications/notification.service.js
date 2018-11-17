import { environment } from '../../environment';
import { NOTIFICATIONS_ACTIONS } from './notification.reducers';
import store from '../store';
import { getKatelleaTokenHeaders } from '../helper';

// const LAST_NOTIFICATIONS_REQUEST_DATE = 'LAST_NOTIFICATIONS_REQUEST_DATE';

class NotificationServiceFactory {

  async getLastNotifications() {
    // Wait 2 minutes before each notification request
    /*
    FIXME: how to handle the first request/ page change ?
    if (localStorage.getItem(LAST_NOTIFICATIONS_REQUEST_DATE) !== null) {
      let lastNotificationRequest = dayjs(localStorage.getItem(LAST_NOTIFICATIONS_REQUEST_DATE));
      if(dayjs().isBefore(lastNotificationRequest.add(2, 'minute'))) return;
    }
    // Update last request time
    localStorage.setItem(LAST_NOTIFICATIONS_REQUEST_DATE, new Date());
    */


    let url = `${environment.SERVER_URL}${environment.NOTIFICATIONS_ENDPOINT}`;
    let headers = getKatelleaTokenHeaders();

    try {
      let response = await fetch(url, { headers });
      if (response.status === 200) {
        let data = await response.json();
        store.dispatch({
          type: NOTIFICATIONS_ACTIONS.ADD_NOTIFICATIONS,
          data
        });
      }
    } catch(error) {
      store.dispatch({
        type: NOTIFICATIONS_ACTIONS.ADD_NOTIFICATIONS,
        data: []
      });
    }
  }
}


// Export as singleton
const notificationService = new NotificationServiceFactory();
Object.freeze(notificationService);
export { notificationService  as NotificationService };