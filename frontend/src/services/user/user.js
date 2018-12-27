import { Establishment } from '../establishment/establishment';

import { GENDER } from '../../enum';
import { dateFormatYearMonthDay } from '../date-helper';

export default class User {
  constructor({
    id,
    name,
    email,
    gender,
    currentDonation,
    lastDonationDate,
    quotaExceeded,
    lastDonationType,
    donationPreference,
    bloodType,
    sponsor,
    establishment,
    firstVisit,
    minimumDate,
    sponsorToken,
    katelleaToken,
    plateletActive,
    lastNotificationReadDate,
    createdAt,
    updatedAt
  }
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.gender = gender ? gender.toUpperCase(): undefined;
    this.currentDonation = currentDonation;
    this.lastDonationDate = lastDonationDate;
    this.quotaExceeded = quotaExceeded;
    this.lastDonationType = lastDonationType;
    this.donationPreference = donationPreference;
    this.bloodType = bloodType;
    this.sponsorToken = sponsorToken;
    this.sponsor = sponsor ? User.sponsorFromJSON(sponsor) : null;
    this.katelleaToken = katelleaToken;

    this.establishment = establishment ? Establishment.fromJSON(establishment) : null;
    this.firstVisit = firstVisit;
    this.minimumDate = new Date(minimumDate);
    this.plateletActive = plateletActive || false;

    this.lastNotificationReadDate = new Date(lastNotificationReadDate);

    this.createdAt = new Date(createdAt);
    this.updatedAt = new Date(updatedAt);
  }

  getLastDonation() {
    return new Date(this.lastDonationDate);
  }

  isProfileComplete() {
    return this.createdAt;
  }

  hasCurrentDonation() {
    return this.currentDonation !== undefined && this.currentDonation !== null;
  }

  toJSON() {
    return {
      name: this.name,
      email: this.email,
      gender: this.gender !== GENDER.MALE && this.gender === GENDER.FEMALE ? this.gender : GENDER.UNKNOWN,
      currentDonation: this.currentDonation,
      lastDonationDate: this.lastDonationDate ? dateFormatYearMonthDay(this.lastDonationDate) : null,
      lastDonationType: this.lastDonationType,
      donationPreference: this.donationPreference,
      bloodType: this.bloodType,
      minimumDate: dateFormatYearMonthDay(this.minimumDate),
      plateletActive: this.plateletActive,
      establishmentId: this.establishment ? this.establishment.id : null,
      lastNotificationReadDate: this.lastNotificationReadDate ? dateFormatYearMonthDay(this.lastNotificationReadDate) : undefined,
    };
  }

  copy() {
    return new User({
      id: this.id,
      name: this.name,
      email: this.email,
      gender: this.gender,
      currentDonation: this.currentDonation,
      lastDonationDate: this.lastDonationDate,
      quotaExceeded: this.quotaExceeded,
      lastDonationType: this.lastDonationType,
      donationPreference: this.donationPreference,
      bloodType: this.bloodType,
      sponsor: this.sponsor,
      establishment: this.establishment,
      firstVisit: this.firstVisit,
      minimumDate: dateFormatYearMonthDay(this.minimumDate),
      sponsorToken: this.sponsorToken,
      katelleaToken: this.katelleaToken,
      plateletActive: this.plateletActive,
      lastNotificationReadDate: this.lastNotificationReadDate ? dateFormatYearMonthDay(this.lastNotificationReadDate): this.lastNotificationReadDate,
      createdAt: dateFormatYearMonthDay(this.createdAt),
      updatedAt: dateFormatYearMonthDay(this.updatedAt)
    });
  }

  toString() {
    return `id: ${this.id} - name: ${this.name} - email: ${this.email} - gender: ${this.gender}
            - lastDonationDate: ${this.lastDonationDate} - katelleaToken: ${this.katelleaToken} - bloodType: ${this.bloodType}
            - sponsorToken: ${this.sponsorToken} - minimumDate: ${this.minimumDate} - donationPreference: ${this.donationPreference}`;
  }


  static sponsorFromJSON(sponsorData) {

    return new User({
      id: null,
      name: sponsorData.name,
      email: null,
      gender: null,
      currentDonation: null,
      lastDonationDate: sponsorData.lastDonationDate,
      quotaExceeded: null,
      lastDonationType: sponsorData.lastDonationType,
      donationPreference: sponsorData.donationPreference,
      bloodType: sponsorData.bloodType,
      sponsor: null,
      establishment: sponsorData.establishment,
      firstVisit: null,
      minimumDate: null,
      sponsorToken: sponsorData.sponsorToken,
      katelleaToken: null,
      plateletActive: null,
      lastNotificationReadDate: null,
      createdAt: sponsorData.createdAt,
      updatedAt: null
    });
  }

  bloodTypeToString() {
    if (this.bloodType === 'UNKNOWN') return 'Non renseigné';
    return this.bloodType;
  }
}
