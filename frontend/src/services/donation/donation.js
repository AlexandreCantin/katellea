import { Establishment } from '../establishment/establishment';
import { dateFormatYearMonthDay } from '../date-helper';

export const DONATION_STATUS = {
  POLL_ON_GOING: 'POLL_ON_GOING',
  POLL_ENDED: 'POLL_ENDED',
  DATE_CONFIRMED: 'DATE_CONFIRMED',
  DONE: 'DONE',
  CANCELED: 'CANCELED'
};

export const DONATION_VISIBILITY = { PRIVATE: 'PRIVATE', PUBLIC: 'PUBLIC' };

export default class Donation {

  constructor({ id, isPublicDonation, status, establishment, mobileCollect, donationType, pollSuggestions, pollAnswers, finalDate, events, finalAttendeesUser, finalAttendeesGuest, statisticsDate, createdBy, createdByGuest, donationToken, createdAt, updatedAt }) {
    this.id = id;
    this.isPublicDonation = isPublicDonation;
    this.status = status;
    this.mobileCollect = mobileCollect;
    this.establishment = establishment ? Establishment.fromJSON(establishment) : null;
    this.donationType = donationType;
    this.pollSuggestions = pollSuggestions;
    this.pollAnswers = pollAnswers || [];
    this.finalDate = new Date(finalDate);
    this.events = events || [];
    this.finalAttendeesUser = finalAttendeesUser || [];
    this.finalAttendeesGuest = finalAttendeesGuest || [];
    this.statisticsDate = statisticsDate;
    this.donationToken = donationToken;
    this.createdBy = createdBy;
    this.createdByGuest = createdByGuest;
    this.createdAt = new Date(createdAt);
    this.updatedAt = new Date(updatedAt);
  }

  toJSON() {
    return {
      status: this.status,
      isPublicDonation: this.isPublicDonation,
      mobileCollect: this.mobileCollect,
      establishmentId: this.establishment ? this.establishment.id : null,
      donationType: this.donationType,
      pollSuggestions: this.pollSuggestions,
      finalDate: this.finalDate,
      finalAttendeesGuest: this.finalAttendeesGuest,
      finalAttendeesUser: this.finalAttendeesUser,
      createdByGuest: this.createdByGuest
    };
  }

  copy() {
    return new Donation({
      id: this.id,
      isPublicDonation: this.isPublicDonation,
      status: this.status,
      establishment: this.establishment,
      mobileCollect: this.mobileCollect,
      donationType: this.donationType,
      pollSuggestions: this.pollSuggestions,
      pollAnswers: this.pollAnswers,
      finalDate: this.finalDate,
      events: this.events,
      finalAttendeesGuest: this.finalAttendeesGuest,
      finalAttendeesUser: this.finalAttendeesUser,
      statisticsDate: this.statisticsDate,
      donationToken: this.donationToken,
      createdBy: this.createdBy,
      createdByGuest: this.createdByGuest,
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
    if(!this.createdBy) return false;
    return +this.createdBy.id === +userId;
  }
  hasEstablishment() {
    return this.establishment !== undefined && this.establishment !== null;
  }
  isUserFinalAttendee(userId) {
    return this.finalAttendeesUser.indexOf(+userId) !== -1;
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

  isMultipleDay() {
    return this.pollSuggestions[0].hasOwnProperty('date');
  }

  getCreatorName() {
    return this.createdBy ? this.createdBy.name : this.createdByGuest.name;
  }
}