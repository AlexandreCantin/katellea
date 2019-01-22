import mongoose from 'mongoose';
import { MongooseAutoIncrementID } from 'mongoose-auto-increment-reworked';

const EmailVerificationSchema = mongoose.Schema({
  token: String,
  user: { type: Number, ref: 'User' },
}, { timestamps: true, versionKey: false });

EmailVerificationSchema.plugin(MongooseAutoIncrementID.plugin, { modelName: 'EmailVerification' });
EmailVerificationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    delete ret._id;
  }
});

const EmailVerification = mongoose.model('EmailVerification', EmailVerificationSchema);

export default EmailVerification;
