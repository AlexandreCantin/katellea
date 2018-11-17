import mongoose from 'mongoose';
import { MongooseAutoIncrementID } from 'mongoose-auto-increment-reworked';

import { JWTService } from '../services/jwt.service';
import { extractEnumValues, GENDER, BLOOD_TYPE, DONATION_TYPE } from '../constants';


const UserSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true
  },
  gender: {
    type: String,
    enum: extractEnumValues(GENDER)
  },
  lastDonationDate: Date,
  minimumDate: Date,
  lastDonationType: {
    type: String,
    enum: extractEnumValues(DONATION_TYPE)
  },
  donationPreference: {
    type: String,
    enum: extractEnumValues(DONATION_TYPE)
  },
  bloodType: {
    type: String,
    enum: extractEnumValues(BLOOD_TYPE)
  },
  sponsorToken: String,
  isAdmin: Boolean,
  firstVisit: Boolean,
  plateletActive: {
    type: Boolean,
    default: false
  },
  katelleaToken: {
    type: String,
    default: ''
  },

  // Statistics
  bloodDonationDone: { type: Number, default: 0 },
  plasmaDonationDone: { type: Number, default: 0 },
  plateletDonationDone: { type: Number, default: 0 },

  lastNotificationReadDate: Date,

  // Foreign Keys
  currentDonation: { type: Number, ref: 'Donation' },
  sponsor: { type: Number, ref: 'User' },
  establishment: { type: Number, ref: 'Establishment' },

  // Sponsor & établissement
}, { timestamps: true });


UserSchema.plugin(MongooseAutoIncrementID.plugin, { modelName: 'User' });
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    if(!ret.katelleaToken) delete ret.katelleaToken;
    delete ret._id;
  }
});


// METHODS
UserSchema.methods.addKatelleaToken = function() {
  this.katelleaToken = JWTService.encode(this);
};
const User = mongoose.model('User', UserSchema);

// Global
User.publicFields = '_id firstName lastName gender establishment bloodType sponsorToken';

export default User;
