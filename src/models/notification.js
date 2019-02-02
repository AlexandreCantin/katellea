import mongoose from 'mongoose';
import { MongooseAutoIncrementID } from 'mongoose-auto-increment-reworked';
import { NOTIFICATION_TYPES, extractEnumValues } from '../constants';

const NotificationSchema = mongoose.Schema({
  name: {
    type: String,
    enum: extractEnumValues(NOTIFICATION_TYPES)
  },
  date: Date,
  donationId: { type: Number, ref: 'Donation' },

  author: { type: Number, ref: 'User' }, // Registered user
  username: String, // Guest user

  forUser: { type: Number, ref: 'User' },
  data: Object,
}, { timestamps: true, versionKey: false });

NotificationSchema.plugin(MongooseAutoIncrementID.plugin, { modelName: 'Notification' });
NotificationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
});
const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
