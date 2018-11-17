import mongoose from 'mongoose';
import { MongooseAutoIncrementID } from 'mongoose-auto-increment-reworked';


const EstablishmentSchema = mongoose.Schema({
  name: String,
  address: String,
  zipcode: String,

  phone: String,
  email: String,

  bloodAvailable: Boolean,
  bloodAppointement: Boolean,
  plasmaAvailable: Boolean,
  plasmaAppointement: Boolean,
  plateletAvailable: Boolean,
  plateletAppointement: Boolean,
  boneMarrowAvailable: Boolean,
  boneMarrowAppointement: Boolean,

  mondayHours: String,
  tuesdayHours: String,
  wenesdayHours: String,
  thursdayHours: String,
  fridayHours: String,
  sathurdayHours: String,

  longitude: Number,
  latitude: Number,
  coordinates: {
    type: [Number],
    index: '2dsphere'
  },

  efsComment: String,
  internalComment: String, // For Katella team only, to save some history for example

  distance: Number
}, { timestamps: true, versionKey: false });

EstablishmentSchema.plugin(MongooseAutoIncrementID.plugin, { modelName: 'Establishment' });
EstablishmentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    delete ret.internalComment;
    delete ret._id;
  }
});


// Instance methods
EstablishmentSchema.methods.addDistance = function(distance) {
  this.distance = distance;
};

const Establishment = mongoose.model('Establishment', EstablishmentSchema);

export default Establishment;
