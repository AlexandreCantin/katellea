import express from 'express';

import User from '../../models/user';
import { injectUserFromToken } from '../../middlewares/inject-user-from-token';

const adminUsersRoutes = express.Router();
adminUsersRoutes.use(injectUserFromToken);


const getUser = async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate({ path: 'establishment', model: 'Establishment' })
    .populate({ path: 'sponsor', model: 'User', select: User.publicFields });
  if (user == null) return res.status(NOT_FOUND).send();

  return res.json(user);
};

const getAllUsers = async (req, res) => {
  let page = +req.query.page || 0;
  let pageSize = +req.query.pageSize || 30;

  const users = await User.find({}).sort({ createdAt: +1 }).skip(page*pageSize).limit(pageSize);
  return res.json(users);
}

const doSearchUser = async (req, res) => {
  const term = req.query.term;

  const users = await User.find({
    $or: [
      { name: new RegExp(term, 'i') },
      { email: new RegExp(term, 'i') }
    ]
  });

  return res.json(users);
}

const getTotalUserNumber = async (req, res) => {
  const userTotalCount = await User.countDocuments({});
  return res.json(userTotalCount);
}

adminUsersRoutes.get('/', getAllUsers);
adminUsersRoutes.get('/count', getTotalUserNumber);
adminUsersRoutes.get('/search', doSearchUser);
adminUsersRoutes.get('/:id', getUser);
export default adminUsersRoutes;
