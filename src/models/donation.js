import mongoose from 'mongoose';
import { MongooseAutoIncrementID } from 'mongoose-auto-increment-reworked';
import { extractEnumValues, DONATION_TYPE, DAY_PARTS, DONATION_VISIBILITY, DONATION_STATUS, DONATION_EVENTS, POLL_ANSWERS } from '../constants';
import { createNotification } from '../helpers/notification.helper';

const DonationSchema = mongoose.Schema({
  donationType: {
    type: String,
    enum: extractEnumValues(DONATION_TYPE)
  },
  status: {
    type: String,
    enum: extractEnumValues(DONATION_STATUS)
  },
  visibility: {
    type: String,
    enum: extractEnumValues(DONATION_VISIBILITY)
  },
  finalDate: Date,
  finalAttendees: [{
    type: Number,
    ref: 'User'
  }],

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
    author: { type: Number, ref: 'User' },
    answers: [{
      type: String,
      enum: extractEnumValues(POLL_ANSWERS)
    }]
  }],
  donationToken: String,

  // Events
  events: [{
    name: {
      type: String,
      enum: extractEnumValues(DONATION_EVENTS)
    },
    date: Date,
    author: { type: Number, ref: 'User' },
    comment: String,
    data: Object,
  }],


  // Date for statistics analysis
  statisticsDate: Date,

  createdBy: { type: Number, ref: 'User' },
}, { timestamps: true, versionKey: false });

DonationSchema.plugin(MongooseAutoIncrementID.plugin, { modelName: 'Donation' });

// METHODS
DonationSchema.methods.notifyCreator = function(notificationType, authorId) {
  createNotification({
    name: notificationType,
    author: authorId,
    forUser: this.createdBy,
    date: new Date(),
    donationId: this.id
  });
};


const Donation = mongoose.model('Donation', DonationSchema);

Donation.publicFieldsAsArray = ['createdAt', 'createdBy', 'establishment', 'mobileCollect', 'donationType', 'donationToken', 'pollSuggestions'];
Donation.historyFieldsAsArray = ['createdAt', 'createdBy', 'establishment', 'mobileCollect', 'donationType', 'finalDate'];

export default Donation;
