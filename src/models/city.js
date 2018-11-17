import mongoose from 'mongoose';
import { MongooseAutoIncrementID } from 'mongoose-auto-increment-reworked';

const CitySchema = mongoose.Schema({
  csvId: Number,
  department: Number,
  name: String,
  slug: String,
  zipcode: String,
  longitude: Number,
  latitude: Number,
}, { timestamps: true, versionKey: false });

CitySchema.plugin(MongooseAutoIncrementID.plugin, { modelName: 'City' });

const City = mongoose.model('City', CitySchema);

export default City;
