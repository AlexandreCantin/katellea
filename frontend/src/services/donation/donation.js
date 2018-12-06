import { Establishment } from '../establishment/establishment';
import { dateFormatYearMonthDay } from '../date-helper';

export const DONATION_STATUS = {
  POLL_ON_GOING: 'POLL_ON_GOING',
  POLL_ENDED: 'POLL_ENDED',
  DATE_CONFIRMED: 'DATE_CONFIRMED',
  DONE: 'DONE',
  CANCELED: 'CANCELED'
};

export const DONATION_VISIBILITY = {
  PRIVATE: 'PRIVATE',
  SMALL_NETWORK: 'SMALL_NETWORK',
  PUBLIC: 'PUBLIC'
};

export default class Donation {

  constructor({ id, status, visibility, establishment, mobileCollect, donationType, pollSuggestions, pollAnswers, finalDate, events, finalAttendees, statisticsDate, createdBy, donationToken, createdAt, updatedAt }) {
    this.id = id;
    this.status = status;
    this.visibility = visibility;
    this.mobileCollect = mobileCollect;
    this.establishment = establishment ? Establishment.fromJSON(establishment) : null;
    this.donationType = donationType;
    this.pollSuggestions = pollSuggestions;
    this.pollAnswers = pollAnswers || [];
    this.finalDate = new Date(finalDate);
    this.events = events || [];
    this.finalAttendees = finalAttendees || [];
    this.statisticsDate = statisticsDate;
    this.donationToken = donationToken;
    this.createdBy = createdBy;
    this.createdAt = new Date(createdAt);
    this.updatedAt = new Date(updatedAt);
  }

  toJSON() {
    return {
      status: this.status,
      visibility: this.visibility,
      mobileCollect: this.mobileCollect,
      establishmentId: this.establishment ? this.establishment.id : null,
      donationType: this.donationType,
      pollSuggestions: this.pollSuggestions,
      finalDate: dateFormatYearMonthDay(this.lastDonationDate),
      finalAttendees: this.finalAttendees,
      // pollAnswers: this.pollAnswers,
      // events: this.events,
    };
  }

  copy() {
    return new Donation({
      id: this.id,
      status: this.status,
      visibility: this.visibility,
      establishment: this.establishment,
      mobileCollect: this.mobileCollect,
      donationType: this.donationType,
      pollSuggestions: this.pollSuggestions,
      pollAnswers: this.pollAnswers,
      finalDate: dateFormatYearMonthDay(this.finalDate),
      events: this.events,
      finalAttendees: this.finalAttendees,
      statisticsDate: this.statisticsDate,
      donationToken: this.donationToken,
      createdBy: this.createdBy,
      createdAt: dateFormatYearMonthDay(this.createdAt),
      updatedAt: dateFormatYearMonthDay(this.updatedAt)
    });
  }


  isPollOnGoing() {
    return this.status === DONATION_STATUS.POLL_ON_GOING;
  }
  isPollEnded() {
    return this.status === DONATION_STATUS.POLL_ENDED;
  }
  isScheduled() {
    return this.status === DONATION_STATUS.DATE_CONFIRMED;
  }
  isDone() {
    return this.status === DONATION_STATUS.DONE;
  }
  isCancelled() {
    return this.status === DONATION_STATUS.CANCELED;
  }

  isCreator(userId) {
    return +this.createdBy.id === +userId;
  }
  hasEstablishment() {
    return this.establishment !== undefined && this.establishment !== null;
  }
  isUserFinalAttendee(userId) {
    return this.finalAttendees.indexOf(+userId) !== -1;
  }

  isEstablishmentDonation() {
    if(this.establishment === undefined) return false;
    if(this.establishment === null) return false;
    return true;
  }

  isMobileCollect() {
    if(this.mobileCollect === null) return false;
    if(this.mobileCollect === undefined) return false;
    return true;
  }
}