import { environment } from '../../environment';

import { FlashMessageService } from '../flash-message/flash-message.service';
import { getKatelleaTokenHeaders } from '../helper';
import User from './user';
import store from '../store';

import { USER_ACTIONS } from './user.reducers';
import { DONATION_ACTIONS } from '../donation/donation.reducers';
import { NOTIFICATIONS_ACTIONS } from '../notifications/notification.reducers';
import { FLASH_MESSAGE_ACTIONS } from '../flash-message/flash-message.reducers';
import { USER_TEMP_ACTIONS } from '../user-temp/user-temp.reducers';

export const ALREADY_SEND_LAST_HOUR = 'ALREADY_SEND_LAST_HOUR';

class UserServiceFactory {

  isProfileComplete() {
    let currentUser = store.getState().user || {};
    if (!currentUser.id) return false;
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

  // SPONSOR
  getSponsorUser(networkToken) {
    let url = `${environment.SERVER_URL}${environment.USER_BY_TOKEN_ENDPOINT}${networkToken}`;

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url);

      if (response.status === 200) {
        let userData = await response.json();

        if (userData) {
          let user = new User({
            id: userData.id,
            name: userData.name,
            email: null,
            emailVerified: null,
            gender: null,
            currentDonationToken: null,
            lastDonationDate: userData.lastDonationDate,
            quotaExceeded: null,
            lastDonationType: userData.lastDonationType,
            donationPreference: userData.donationPreference,
            bloodType: null,
            sponsor: userData.sponsor,
            network: null,
            establishment: userData.establishment,
            firstVisit: null,
            minimumDate: null,
            networkToken: userData.networkToken,
            katelleaToken: null,
            plateletActive: null,
            godchildNumber: null,
            notificationSettings: null,
            lastNotificationReadDate: null,
            stats: null,
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

  getSponsorCompatibility(bloodType) {
    let url = `${environment.SERVER_URL}${environment.USER_COMPATIBILITY_ENDPOINT}/${bloodType}`;
    let headers = getKatelleaTokenHeaders();

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { headers });
      if (response.status === 200) {
        let data = await response.json();
        resolve(data.direction);
        return;
      }
      reject();
    });
  }


  saveKatelleaUser(user, isCreation = false, sponsoredByToken = '', socialNetworkKey='') {
    let url = `${environment.SERVER_URL}${environment.USER_ENDPOINT}`;
    let headers = getKatelleaTokenHeaders(!isCreation);

    if(isCreation && !socialNetworkKey) throw new Error('No socialNetworkKey given when creating user')

    let userData = user.toJSON();
    if (sponsoredByToken) userData.sponsoredByToken = sponsoredByToken;
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
      } else if (response.status === 403 && isCreation) {
        FlashMessageService.createError("La limite des comptes -pour la beta- est atteinte.", 'registerForm');
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


  validateUserMail(token) {
    let url = `${environment.SERVER_URL}${environment.USER_SEND_VALIDATE_MAIL_ENDPOINT}${token}`;

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { method: 'POST' });
      if(response.status === 200) {
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

  reSendEmailVerifiedEmail() {
    let url = `${environment.SERVER_URL}${environment.USER_RESEND_MAIL_ENDPOINT}`;
    let headers = getKatelleaTokenHeaders();

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { method: 'POST', headers });
      if (response.status === 200) { resolve(); return; }
      else if (response.status === 403) { reject(new Error(ALREADY_SEND_LAST_HOUR)); return; }
      reject();
    });
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


  getNetwork() {
    let url = `${environment.SERVER_URL}${environment.USER_NETWORK_ENDPOINT}`;
    let headers = getKatelleaTokenHeaders(true);

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { headers });
      if (response.status === 200) {
        let godchilds = await response.json();
        if (godchilds) { resolve(godchilds); return; }
      }
      reject();
    });
  }

  addFriendship(friendNetworkToken) {
    let url = `${environment.SERVER_URL}${environment.USER_ADD_FRIEND_ENDPOINT}`;
    let headers = getKatelleaTokenHeaders();

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { headers, method: 'POST', body: JSON.stringify({ friendNetworkToken }) });
      if(response.status === 200) {
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

}


// Export as singleton
const userService = new UserServiceFactory();
Object.freeze(userService);
export { userService as UserService };