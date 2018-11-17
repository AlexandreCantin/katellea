import { getKatelleaTokenHeaders } from '../helper';
import { environment } from '../../environment';
import { DONATION_ACTIONS } from './donation.reducers';
import store from '../store';

class DonationServiceFactory {

  async getCurrentDonation(donationId) {
    let url = `${environment.SERVER_URL}${environment.DONATION_ENDPOINT}/${donationId}`;
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
      let response = await fetch(url);
      let donationsData = await response.json();
      if (donationsData) {
        resolve(donationsData);
        return;
      }

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

  updateDonation(data) {
    let donation = store.getState().donation.copy();

    Object.keys(data).map(key => {
      if (!donation.hasOwnProperty(key)) throw new Error(`Unknow field ${key}`);
      return donation[key] = data[key];
    });

    return this.saveDonation(donation);
  }


  saveDonation(donation, isCreation = false) {
    let url = `${environment.SERVER_URL}${environment.DONATION_ENDPOINT}`;
    if (!isCreation) url = `${url}/${donation.id}`;

    let headers = getKatelleaTokenHeaders();

    let donationData = donation.toJSON();

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { headers, method: isCreation ? 'POST' : 'PUT', body: JSON.stringify(donationData) });
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


  savePollAnswer(donation, answers, isCreation = false) {
    let url = `${environment.SERVER_URL}${environment.DONATION_ENDPOINT}/${donation.id}${environment.POLL_ANSWER_ENDPOINT}`;
    let headers = getKatelleaTokenHeaders();

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { headers, method: isCreation ? 'POST' : 'PUT', body: JSON.stringify({ answers }) });
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


  saveComment(donation, comment, isCreation = false) {
    let url = `${environment.SERVER_URL}${environment.DONATION_ENDPOINT}/${donation.id}${environment.COMMENT_ENDPOINT}`;
    if (!isCreation) url = `${url}/${comment.id}`;
    let headers = getKatelleaTokenHeaders();

    return new Promise(async (resolve, reject) => {
      let response = await fetch(url, { headers, method: isCreation ? 'POST' : 'PUT', body: JSON.stringify(comment) });
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

  deleteDonation() {
    store.dispatch({
      type: DONATION_ACTIONS.DELETE_DONATION
    });
  }

  saveDonationInLocalStore(donationData) {
    donationData.id = donationData._id;

    store.dispatch({
      type: DONATION_ACTIONS.SET_DONATION,
      data: donationData
    });
  }
}

// Export as singleton
const donationService = new DonationServiceFactory();
Object.freeze(donationService);
export { donationService as DonationService };