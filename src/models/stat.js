import mongoose from 'mongoose';
import { MongooseAutoIncrementID } from 'mongoose-auto-increment-reworked';

const StatisticsSchema = mongoose.Schema({
  nbUsers: Number,
  nbSponsoredUsers: Number,
  dayNbUsers: Number,
  dayNbSponsoredUsers: Number,
  dayString: String,

  // ** Donation done ** //
  // Total
  bloodDonation: Number,
  plasmaDonation: Number,
  plateletDonation: Number,
  // By day
  dayBloodDonation: Number,
  dayPlasmaDonation: Number,
  dayPlateletDonation: Number,

  // ** Donation done by sponsored user ** //
  // Total
  bloodSponsoredDonation: Number,
  plasmaSponsoredDonation: Number,
  plateletSponsoredDonation: Number,
  // By day
  dayBloodSponsoredDonation: Number,
  dayPlasmaSponsoredDonation: Number,
  dayPlateletSponsoredDonation: Number

}, { timestamps: true, versionKey: false });

StatisticsSchema.plugin(MongooseAutoIncrementID.plugin, { modelName: 'Statistics' });
StatisticsSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
});


const Statistics = mongoose.model('Statistics', StatisticsSchema);

export default Statistics;
