import express from 'express';

import AdminLog from '../../models/admin-log';
import User from '../../models/user';
import { injectUserFromToken } from '../../middlewares/inject-user-from-token';

const adminLogsRoutes = express.Router();
adminLogsRoutes.use(injectUserFromToken);

const getAllLogs = async (req, res) => {
  let page = +req.query.page || 0;
  let pageSize = +req.query.pageSize || 50;

  const logs = await AdminLog.find({})
    .sort({ _id: +1 }).skip(page*pageSize).limit(pageSize)
    .populate({ path: 'user', model: 'User', select: User.adminLogFields });
  return res.json(logs);
}

const getTotalLogsNumber = async (req, res) => {
  const logsTotalCount = await AdminLog.countDocuments({});
  return res.json(logsTotalCount);
}

const getAllAdmins = async (req, res) => {
  const adminsIds = await AdminLog.find().distinct('user')
  const admins = await User.find({'_id': { $in: adminsIds }}).select(User.adminLogFields);
  return res.json(admins);
}

const findUserLogs = async (req, res) => {
  const logs = await AdminLog.find({ user : req.params.userId }).sort({ createdAt: +1 })
    .populate({ path: 'user', model: 'User', select: User.adminLogFields });
  return res.json(logs);
}

const findLastUserLogs = async (req, res) => {
  const logs = await AdminLog.find({ user : +req.userId }).sort({ _id: -1 }).skip(1).limit(1);
  return res.json(logs[0]);
}


adminLogsRoutes.get('/', getAllLogs);
adminLogsRoutes.get('/count', getTotalLogsNumber);
adminLogsRoutes.get('/user', getAllAdmins);
adminLogsRoutes.get('/user/last', findLastUserLogs);
adminLogsRoutes.get('/user/:userId', findUserLogs);

export default adminLogsRoutes;
