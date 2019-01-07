import mongoose from 'mongoose';
import { MongooseAutoIncrementID } from 'mongoose-auto-increment-reworked';

const AdminLogSchema = mongoose.Schema({
  user: { type: Number, ref: 'User' },
}, { timestamps: true, versionKey: false });

AdminLogSchema.plugin(MongooseAutoIncrementID.plugin, { modelName: 'AdminLog' });
AdminLogSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    delete ret._id;
  }
});

const AdminLog = mongoose.model('AdminLog', AdminLogSchema);

export default AdminLog;
