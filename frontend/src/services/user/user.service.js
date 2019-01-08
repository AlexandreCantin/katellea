import { environment } from '../../environment';

import { FlashMessageService } from '../flash-message/flash-message.service';
import { getKatelleaTokenHeaders, isEmpty } from '../helper';
import User from './user';
import store from '../store';

import { USER_ACTIONS } from './user.reducers';
import { DONATION_ACTIONS } from '../donation/donation.reducers';
import { NOTIFICATIONS_ACTIONS } from '../notifications/notification.reducers';
import { FLASH_MESSAGE_ACTIONS } from '../flash-message/flash-message.reducers';
import { USER_TEMP_ACTIONS } from '../user-temp/user-temp.reducers';


class UserServiceFactory {

  isAuthentificated() {
    let currentUser = store.getState().user || {};
    if (!isEmpty(currentUser)) return true;
    return false;
  }


  isProfileComplete() {
    let currentUser = store.getState().user || {};
    if (isEmpty(currentUser)) return false;
    return currentUser.isProfileComplete();
  }

  isUserAdmin() {
    let url = `${environment.SERVER_URL}${environment.USER_IS_ADMIN_ENDPOINT}`;
    let headers = getKatelleaTokenHeaders();

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { headers, method: 'POST' });
      if (response.status === 200) {
        resolve();
        return;
      }
      reject();
    });
  }

  /**
   * This field role is to identified user when they come back.
   * Its form is : SOCIAL_NETWORK + '_' + ID
   * Exemple: facebook_17387398738979, twitter_123878754522...
   *
   * Why not used email ? Because Instagram and Twitter don't automaticaly returns email with the token...
   * */
  generateSocialNetworkKey() {
    const userTempProfile = store.getState().userTempProfile;
    const { origin, userID } = userTempProfile;

    if(!origin || !userID) throw new Error(`No origin and/or on user ' : ${origin} - ${userID}`);
    return origin + '_' + userID;
  }


  logout() {
    localStorage.removeItem('USER_TOKEN');
    fetch(`${environment.SERVER_URL}${environment.USER_ENDPOINT_LOGOUT}`);
    store.dispatch({ type: USER_ACTIONS.DELETE_USER });
    store.dispatch({ type: DONATION_ACTIONS.DELETE_DONATION });
    store.dispatch({ type: USER_TEMP_ACTIONS.DELETE_PROFILE });
    store.dispatch({ type: NOTIFICATIONS_ACTIONS.DELETE_NOTIFICATIONS });
    store.dispatch({ type: FLASH_MESSAGE_ACTIONS.DELETE });
  }

  // EXPORT DATA
  callExportData(method) {
    let url = `${environment.SERVER_URL}${environment.USER_ENDPOINT_GRPD_EXPORT}`;
    let headers = getKatelleaTokenHeaders();

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { headers, method });
      if (response.status === 200) {
        resolve();
        return;
      }
      reject();
    });
  }
  isExportDataOnGoing() { return this.callExportData('GET'); }
  askExportData() { return this.callExportData('POST'); }
  cancelExportData() { return this.callExportData('DELETE'); }


  // ESTABLISHMENT
  addEstablishment(establishment) {
    let user = store.getState().user;
    user.establishment = establishment;
    return this.saveKatelleaUser(user);
  }

  removeEstablishment() {
    let user = store.getState().user;
    user.establishment = undefined;
    return this.saveKatelleaUser(user);
  }


  getKatelleaUserWithReminder(token) {
    let url = `${environment.SERVER_URL}${environment.USER_ENDPOINT_WITH_TOKEN}${token}`;

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url);
      if (response.status === 200) {

        let userData = await response.json();
        if (userData) {
          this.saveUserInLocalStore(userData);
          resolve();
          return;
        }

      }
      reject();
    });
  }


  async updateLastNotificationReadDate(lastNotificationReadDate) {
    let url = `${environment.SERVER_URL}${environment.USER_UPDATE_LAST_NOTIFICATION_READ_DATE}`;
    let headers = getKatelleaTokenHeaders();

    let response = await fetch(url, { headers, method: 'PUT', body: JSON.stringify({ lastNotificationReadDate }) });
    if (response.status === 200) {
      store.dispatch({
        type: USER_ACTIONS.USER_UPDATE_LAST_NOTIFICATION_READ_DATE,
        data: { lastNotificationReadDate }
      });
    }
  }


  getSponsorUser(sponsorToken) {
    let url = `${environment.SERVER_URL}${environment.USER_SPONSOR_ENDPOINT}${sponsorToken}`;

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url);

      if (response.status === 200) {
        let userData = await response.json();

        if (userData) {
          let user = new User({
            id: userData.id,
            name: userData.name,
            email: null,
            gender: null,
            currentDonation: null,
            lastDonationDate: userData.lastDonationDate,
            quotaExceeded: null,
            lastDonationType: userData.lastDonationType,
            donationPreference: userData.donationPreference,
            bloodType: userData.bloodType,
            sponsor: userData.sponsor,
            establishment: userData.establishment,
            firstVisit: null,
            minimumDate: null,
            sponsorToken: userData.sponsorToken,
            katelleaToken: null,
            plateletActive: null,
            lastNotificationReadDate: null,
            createdAt: userData.createdAt,
            updatedAt: null
          });
          resolve(user);
          return;
        }
      }
      reject();
    });
  }


  saveKatelleaUser(user, isCreation = false, sponsoredByToken = '', donationToken = '', socialNetworkKey='') {
    let url = `${environment.SERVER_URL}${environment.USER_ENDPOINT}`;
    let headers = getKatelleaTokenHeaders(!isCreation);

    if(isCreation && !socialNetworkKey) throw new Error('No socialNetworkKey given when creating user')

    let userData = user.toJSON();
    if (sponsoredByToken) userData.sponsoredByToken = sponsoredByToken;
    if (donationToken) userData.donationToken = donationToken;
    if(isCreation) userData.socialNetworkKey = socialNetworkKey;

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { headers, method: isCreation ? 'POST' : 'PUT', body: JSON.stringify(userData) });
      if (response.status === 200) {
        let userData = await response.json();
        if (userData) {
          this.saveUserInLocalStore(userData);
          resolve();
          return;
        }
      } else if (response.status === 401 && isCreation) {
        FlashMessageService.createError('Un utilisateur utilise déjà cette adresse e-mail.', 'registerForm');
        reject();
        return;
      }
      reject();
    });
  }


  updateUser(data, sponsoredByToken = '') {
    let user = store.getState().user.copy();

    Object.keys(data).map(key => {
      if (!user.hasOwnProperty(key)) throw new Error(`Unknow field ${key}`);
      return user[key] = data[key];
    });

    return this.saveKatelleaUser(user, false, sponsoredByToken);
  }


  deleteKatelleaUser() {
    let url = `${environment.SERVER_URL}${environment.USER_ENDPOINT}`;
    let headers = getKatelleaTokenHeaders();

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { method: 'DELETE', headers });
      if (response.status === 200) resolve();
      else reject();
    });
  }

  // Create or update user from JSON DATA
  saveUserInLocalStore(userData) {
    // Store token in LocalStorage for remember-me
    if (userData.katelleaToken) {
      localStorage.setItem('USER_TOKEN', userData.katelleaToken);
    }

    store.dispatch({
      type: USER_ACTIONS.SET_USER,
      data: userData
    });
  }
}


// Export as singleton
const userService = new UserServiceFactory();
Object.freeze(userService);
export { userService as UserService };