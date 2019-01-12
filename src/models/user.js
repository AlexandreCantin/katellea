import mongoose from 'mongoose';
import { MongooseAutoIncrementID } from 'mongoose-auto-increment-reworked';

import { JWTService } from '../services/jwt.service';
import { extractEnumValues, GENDER, BLOOD_TYPE, DONATION_TYPE } from '../constants';


const UserSchema = mongoose.Schema({
  name: String,
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
  quotaExceeded: {
    type: Boolean,
    default: false
  },
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

  godchildNumber: {
    type: Number,
    default: 0
  },

  plateletActive: {
    type: Boolean,
    default: false
  },
  katelleaToken: {
    type: String,
    default: ''
  },

  /**
   * This field role is to identified user when they come back.
   * Its form is : SOCIAL_NETWORK + '_' + ID
   * Exemple: facebook_17387398738979, twitter_123878754522...
   *
   * Why not used email ? Because Instagram and Twitter don't automaticaly returns email with the token...
   * */
  socialNetworkKey: String,

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
    delete ret.socialNetworkKey;
    delete ret._id;
  }
});


// METHODS
UserSchema.methods.addKatelleaToken = function() {
  this.katelleaToken = JWTService.encode(this);
};
const User = mongoose.model('User', UserSchema);

// Global
User.publicFields = '_id name establishment sponsorToken';
User.compatibilityFields = '_id name bloodType';
User.adminLogFields = '_id name';

export default User;
