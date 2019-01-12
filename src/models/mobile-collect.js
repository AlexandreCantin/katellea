
import mongoose from 'mongoose';
import { MongooseAutoIncrementID } from 'mongoose-auto-increment-reworked';

const MobileCollectSchema = mongoose.Schema({
  place: String,
  city: String,
  beginDate: Date,
  endDate: Date,
  multipleDay: Boolean,
  longitude: Number,
  latitude: Number,
  coordinates: {
    type: [Number],
    index: '2dsphere'
  },
  distance: Number
}, { timestamps: true, versionKey: false });

MobileCollectSchema.plugin(MongooseAutoIncrementID.plugin, { modelName: 'MobileCollect' });
MobileCollectSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    delete ret._id;
  }
});

const MobileCollect = mongoose.model('MobileCollect', MobileCollectSchema);
export default MobileCollect;
