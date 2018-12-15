
import mongoose from 'mongoose';
import { MongooseAutoIncrementID } from 'mongoose-auto-increment-reworked';
import { GRPD_EXPORT_STATUS, extractEnumValues } from '../constants';

const GRPDExportSchema = mongoose.Schema({
  status: {
    type: String,
    enum: extractEnumValues(GRPD_EXPORT_STATUS)
  },
  token: String,
  user: { type: Number, ref: 'User' },
}, { timestamps: true, versionKey: false });

GRPDExportSchema.plugin(MongooseAutoIncrementID.plugin, { modelName: 'GRPDExport' });
GRPDExportSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    delete ret._id;
  }
});

const GRPDExport = mongoose.model('GRPDExport', GRPDExportSchema);
export default GRPDExport;
