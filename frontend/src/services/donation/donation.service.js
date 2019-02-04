import { getKatelleaTokenHeaders } from '../helper';
import { environment } from '../../environment';
import { DONATION_ACTIONS } from './donation.reducers';
import store from '../store';

class DonationServiceFactory {

  async getCurrentDonation(donationId) {
    // Note: we add /id/ to avoid conflict with /donation/:reqToken in 'react-proxy-routes.js'
    let url = `${environment.SERVER_URL}${environment.DONATION_ENDPOINT}/id/${donationId}`;
    let headers = getKatelleaTokenHeaders();

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { headers });
      if (response.status === 200) {

        let donationData = await response.json();
        if (donationData) {
          this.saveDonationInLocalStore(donationData);
          resolve();
          return;
        }

      }
      reject();
    });
  }

  async getEligibleDonations() {
    let url = `${environment.SERVER_URL}${environment.DONATION_ELIGIBLE_URL}`;
    let headers = getKatelleaTokenHeaders();

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { headers });
      let donationData = await response.json();
      if (donationData) {
        resolve(donationData);
        return;
      }
      reject();
    });
  }


  async getDonationByToken(donationToken) {
    let url = `${environment.SERVER_URL}${environment.DONATION_TOKEN_ENDPOINT}${donationToken}`;
    return new Promise(async (resolve, reject) => {
      try {
        let response = await fetch(url);
        let donationData = await response.json();
        if (donationData) {
          this.saveDonationInLocalStore(donationData);
          resolve();
          return;
        }
      } catch(err) {}

      reject();
    });
  }

  async isDonationAdmin(donationToken, adminToken) {
    let url = `${environment.SERVER_URL}${environment.DONATION_ENDPOINT}/${donationToken}/is-admin/${adminToken}`;

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url);
      if(response.status === 200) { return resolve(true); }
      reject();
    });
  }


  async getHistory() {
    let url = `${environment.SERVER_URL}${environment.DONATION_HISTORY}`;
    let headers = getKatelleaTokenHeaders();

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { headers });
      if (response.status === 200) {
        let donationsData = await response.json();
        if (donationsData) return resolve(donationsData);
      }
      reject();
    });
  }

  async canAccessDonationByToken(donationToken) {
    let url = `${environment.SERVER_URL}${environment.CAN_ACCESS_DONATION_TOKEN_ENDPOINT}${donationToken}`;
    let headers = getKatelleaTokenHeaders();

    return new Promise(async (resolve) => {
      let response = await fetch(url, { headers });
      resolve(response.status === 200);
    });
  }


  async createQuitUserEvent(user, donation, comment) {
    let url = `${environment.SERVER_URL}${environment.DONATION_ENDPOINT}/${donation.id}${environment.DONATION_REMOVE_USER_ENDPOINT}/${user.id}`;
    let headers = getKatelleaTokenHeaders();

    try {
      await fetch(url, { headers, method: 'POST', body: comment ? JSON.stringify({ comment }) : undefined });
    } catch (err) {
      console.error(err);
    }
  }

  formatHourPollSuggestion(hourValue) {
    return hourValue.replace(':', 'h');
  }

  updateDonation(data, adminToken) {
    let donation = store.getState().donation.copy();

    Object.keys(data).map(key => {
      if (!donation.hasOwnProperty(key)) throw new Error(`Unknow field ${key}`);
      return donation[key] = data[key];
    });

    return this.saveDonation(donation, adminToken);
  }


  saveDonation(donation, adminToken = '', isCreation = false, acceptEligibleMail = false) {
    let url = `${environment.SERVER_URL}${environment.DONATION_ENDPOINT}`;
    if (!isCreation) url = `${url}/${donation.donationToken}`;
    if(adminToken) url = `${url}?adminToken=${adminToken}`;

    let headers = getKatelleaTokenHeaders(!adminToken);

    let donationData = donation.toJSON();
    if(acceptEligibleMail) donationData.acceptEligibleMail = acceptEligibleMail;

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { headers, method: isCreation ? 'POST' : 'PUT', body: JSON.stringify(donationData) });
      if (response.status === 200) {
        let donationData = await response.json();
        if (donationData) {
          this.saveDonationInLocalStore(donationData);
          resolve(donationData);
          return;
        }
      }
      reject();
    });
  }


  savePollAnswer(donation, answersData, isCreation = false, addToken = undefined) {
    const method = isCreation ? 'POST' : 'PUT';
    const headers = getKatelleaTokenHeaders(addToken);
    let url = `${environment.SERVER_URL}${environment.DONATION_ENDPOINT}/${donation.donationToken}${environment.POLL_ANSWER_ENDPOINT}`;

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { headers, method, body: JSON.stringify(answersData) });
      if (response.status === 200) {
        let donationData = await response.json();
        if (donationData) {
          this.saveDonationInLocalStore(donationData);
          return resolve();
        }
      }
      reject();
    });
  }


  saveComment(donation, commentData, isCreation = false, addToken = false) {
    let url = `${environment.SERVER_URL}${environment.DONATION_ENDPOINT}/${donation.donationToken}${environment.COMMENT_ENDPOINT}`;
    if (!isCreation) url = `${url}/${commentData.commentId}`;
    let headers = getKatelleaTokenHeaders(addToken);

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { headers, method: isCreation ? 'POST' : 'PUT', body: JSON.stringify(commentData) });
      if (response.status === 200) {
        let donationData = await response.json();
        if (donationData) {
          this.saveDonationInLocalStore(donationData);
          resolve();
          return;
        }
      }
      reject();
    });
  }

  deleteDonation(donation, adminToken='', comment='') {
    let url = `${environment.SERVER_URL}${environment.DONATION_ENDPOINT}/${donation.donationToken}`;
    if(adminToken) url = `${url}?adminToken=${adminToken}`;

    let headers = getKatelleaTokenHeaders(!adminToken);

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { headers, method: 'DELETE', body: JSON.stringify({ comment }) });
      if(response.status === 200) { return resolve(true); }
      reject();
    });
  }

  saveDonationInLocalStore(donationData) {
    donationData.id = donationData._id;

    store.dispatch({
      type: DONATION_ACTIONS.SET_DONATION,
      data: donationData
    });
  }

  // Helper
  separateGuestAndUser(finalAttendees) {
    let finalAttendeesUser = [];
    let finalAttendeesGuest = [];

    // Compute user ids as Number
    finalAttendees.forEach(finalAttendee => {
      if(Number.isInteger(+finalAttendee)) finalAttendeesUser.push(+finalAttendee);
      else finalAttendeesGuest.push(finalAttendee)
    });

    return { finalAttendeesUser, finalAttendeesGuest };
  }
}

// Export as singleton
const donationService = new DonationServiceFactory();
Object.freeze(donationService);
export { donationService as DonationService };