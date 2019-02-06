import mongoose from 'mongoose';
import { MongooseAutoIncrementID } from 'mongoose-auto-increment-reworked';
import { extractEnumValues, DONATION_TYPE, DAY_PARTS, DONATION_VISIBILITY, DONATION_STATUS, DONATION_EVENTS, POLL_ANSWERS } from '../constants';
import { createNotification } from '../helpers/notification.helper';
import MailFactory from '../services/mail.service';

const CreatedByGuestSchema = mongoose.Schema({
  name: String,
  email: String,
});
const CreatedByGuest = mongoose.model('CreatedByGuest', CreatedByGuestSchema);

const DonationSchema = mongoose.Schema({
  // isPublicDonation means that the donation proposal was created by a non-register user
  isPublicDonation: Boolean,

  // User accepts to be contacted when he is eligible to new donation
  acceptEligibleMail: {
    type: Boolean,
    default: false
  },

  visibility: {
    type: String,
    enum: extractEnumValues(DONATION_VISIBILITY)
  },
  donationType: {
    type: String,
    enum: extractEnumValues(DONATION_TYPE)
  },
  status: {
    type: String,
    enum: extractEnumValues(DONATION_STATUS)
  },
  finalDate: Date,


  finalAttendeesUser: [{ type: Number, ref: 'User' }], // Register users
  finalAttendeesGuest: [{ type: String }], // Not registered users

  // Location
  establishment: { type: Number, ref: 'Establishment' },
  mobileCollect: { type: String },

  // Poll
  pollSuggestions: [{
    index: Number,
    // Hour suggestion for mobile collect
    hour: String,
    // Date suggestion for donation in an establishment
    date: Date,
    dayPart: {
      type: String,
      enum: extractEnumValues(DAY_PARTS)
    }
  }],
  pollAnswers: [{
    author: { type: Number, ref: 'User' }, // Register user
    username: String, // Not registered user

    answers: [{
      type: String,
      enum: extractEnumValues(POLL_ANSWERS)
    }]
  }],

  donationToken: String,
  adminToken: String,

  // Events
  events: [{
    name: {
      type: String,
      enum: extractEnumValues(DONATION_EVENTS)
    },
    date: Date,
    author: { type: Number, ref: 'User' }, // Register user
    username: String, // Not registered user
    comment: String,
    data: Object,
  }],

  // Date for statistics analysis
  statisticsDate: Date,


  createdBy: { type: Number, ref: 'User' }, // Registered user
  createdByGuest: CreatedByGuestSchema // Not registered user

}, { timestamps: true, versionKey: false });

DonationSchema.plugin(MongooseAutoIncrementID.plugin, { modelName: 'Donation' });

// METHODS
DonationSchema.methods.getCreatorName = function() {
  if(this.createdByGuest) return this.createdByGuest.name;
  return this.createdBy.name;
}

DonationSchema.methods.notifyCreator = function(notificationType, authorName, userId = undefined) {
  // Register user
  if(this.createdBy) {
    createNotification({
      name: notificationType,
      author: userId,
      username: authorName,
      forUser: this.createdBy,
      date: new Date(),
      donationId: this.id
    });
  } else {
    // Not register user
    MailFactory.sendGuestCreatorMail(this, notificationType, this.createdByGuest.name, this.createdByGuest.email, authorName);
  }


};


const Donation = mongoose.model('Donation', DonationSchema);

Donation.publicFieldsAsArray = ['createdAt', 'createdBy', 'establishment', 'mobileCollect', 'donationType', 'status', 'donationToken', 'pollSuggestions', 'createdByGuest.name', 'events', 'finalAttendeesUser', 'finalAttendeesGuest', 'finalDate', 'pollAnswers', 'statisticsDate', 'isPublicDonation'];
Donation.historyFieldsAsArray = ['createdAt', 'createdBy', 'establishment', 'mobileCollect', 'donationType', 'finalDate'];

export default Donation;
