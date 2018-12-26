import express from 'express';
import dayjs from 'dayjs';
import sanitize from 'sanitize-html';
import * as Sentry from '@sentry/node';

import { injectUserFromToken } from '../middlewares/inject-user-from-token';

import { DONATION_TYPE, DONATION_REST_WEEKS } from '../constants';
import { UNAUTHORIZED, NOT_FOUND, INTERNAL_SERVER_ERROR, OK, FORBIDDEN, BAD_REQUEST } from 'http-status-codes';

import User from '../models/user';
import Donation from '../models/donation';
import { canAccessDonation } from '../middlewares/can-access-donation';
import logger from '../services/logger.service';

import { addWeeksToDate } from '../helpers/date.helper';
import { UserService } from '../services/user.service';


const userRoutes = express.Router();
userRoutes.use(injectUserFromToken);

const getUser = async (req, res) => {
  // Ensure that only admins can get users by id
  if (!req.isAdmin) return res.status(UNAUTHORIZED).send();

  const user = await User.findById(req.params.id)
    .populate({ path: 'establishment', model: 'Establishment' })
    .populate({ path: 'sponsor', model: 'User', select: User.publicFields });
  if (user == null) return res.status(NOT_FOUND).send();

  return res.json(user);
};


const getSponsorUser = async (req, res) => {
  const user = await User.findOne({ sponsorToken: req.params.token })
    .select(User.publicFields)
    .populate({ path: 'establishment', model: 'Establishment' }).exec();
  if (user == null) return res.status(NOT_FOUND).send();

  return res.json(user);
};


const createUser = async (req, res) => {

  if (!req.body.sponsoredByToken) {
    res.status(FORBIDDEN).send();
    return;
  }

  // Get sponsor
  let sponsorId = undefined;
  if (req.body.sponsoredByToken) {
    const sponsorUser = await User.findOne({ sponsorToken: req.body.sponsoredByToken });
    if (sponsorUser) sponsorId = sponsorUser.id;
    // #Beta only ?
    else res.status(BAD_REQUEST).send();
  }

  // Get current donation token
  let currentDonationId = undefined;
  if (req.body.donationToken) {
    const donation = await Donation.findOne({ donationToken: req.body.donationToken });
    if (donation) currentDonationId = donation._id;
  }

  const user = new User();
  user.firstName = sanitize(req.body.firstName);
  user.lastName = sanitize(req.body.lastName);
  user.email = req.body.email;
  user.gender = req.body.gender;
  user.firstVisit = true;
  user.minimumDate = new Date();
  user.lastNotificationReadDate = new Date();
  user.sponsorToken = await UserService.generateUniqueToken();
  user.sponsor = sponsorId ? sponsorId : undefined;
  user.currentDonation = currentDonationId ? currentDonationId : undefined;

  user.bloodDonationDone = 0;
  user.bloodGiven = 0;
  user.plasmaDonationDone = 0;
  user.plasmaGiven = 0;
  user.plateletDonationDone = 0;
  user.plateletGiven = 0;


  try {
    await user.save();

    const userCreated = await User.findById(user._id).populate({ path: 'sponsor', model: 'User', select: User.publicFields });
    userCreated.addKatelleaToken();

    return res.json(userCreated);
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
    return res.status(INTERNAL_SERVER_ERROR).send();
  }
};


const updateNotificationReadDate = async (req, res) => {
  if (!req.body.lastNotificationReadDate) return res.status(UNAUTHORIZED).send();

  try {
    await User.findByIdAndUpdate({ _id: req.userId }, { lastNotificationReadDate: req.body.lastNotificationReadDate });

    return res.status(OK).send();
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
    return res.status(INTERNAL_SERVER_ERROR).send();
  }
};


const updateUser = async (req, res) => {

  const user = new User();
  user.firstName = req.body.firstName || user.firstName;
  user.lastName = req.body.lastName || user.lastName;
  user.email = req.body.email || user.email;
  user.lastDonationDate = req.body.lastDonationDate || user.lastDonationDate;
  user.lastDonationType = req.body.lastDonationType || user.lastDonationType;
  user.donationPreference = req.body.donationPreference || user.donationPreference;
  user.plateletActive = req.body.plateletActive || user.plateletActive;
  user.lastNotificationReadDate = req.body.lastNotificationReadDate || user.lastNotificationReadDate;

  // Get sponsor
  let sponsorId = undefined;
  if (req.body.sponsoredByToken) {
    const sponsorUser = await User.findOne({ sponsorToken: req.body.sponsoredByToken });

    // Note: you can't be your own sponsor
    if (sponsorUser && sponsorUser.id !== req.userId) sponsorId = sponsorUser.id;
  }
  user.sponsor = sponsorId ? sponsorId : undefined;

  // If a user add a new unavailability, make sure to respect the minimum date related to the last donation
  if (req.body.minimumDate) {
    if (user.lastDonationType && user.lastDonationDate) {
      const newMinimumDate = dayjs(req.body.minimumDate);
      const minimumDateDueToDonation = addWeeksToDate(user.lastDonationDate, DONATION_REST_WEEKS[user.lastDonationType]);

      if (newMinimumDate.isAfter(minimumDateDueToDonation)) user.minimumDate = req.body.minimumDate;
    } else {
      // Default case
      user.minimumDate = req.body.minimumDate;
    }
  }

  if (!user.plateletActive && user.lastDonationType == DONATION_TYPE.PLATELET) user.plateletActive = true;

  user.bloodType = req.body.bloodType || user.bloodType;
  user.establishment = req.body.hasOwnProperty('establishmentId') ? req.body.establishmentId : user.establishment;
  user.firstVisit = false;

  // If we get null has currentDonation, we delete the current donation
  if (req.body.hasOwnProperty('currentDonation') && req.body.currentDonation == null) user.currentDonation = null;
  else if (req.body.currentDonation && user.currentDonation == undefined) {
    // Add new currentDonation => Check access
    const donation = await Donation.findById(req.body.currentDonation);
    const canAccess = await canAccessDonation(donation, req.user);
    if (!canAccess) return res.status(UNAUTHORIZED).send();
    user.currentDonation = req.body.currentDonation;
  } else if (req.body.currentDonation != user.currentDonation) {
    // Change current donation => Check access
    const donation = await Donation.findById(req.body.currentDonation);
    const canAccess = await canAccessDonation(donation, req.user);
    if (!canAccess) return res.status(UNAUTHORIZED).send();
    user.currentDonation = req.body.currentDonation;
  }

  try {
    await User.findOneAndUpdate({ _id: req.userId }, user);

    const userUpdated = await User.findById(req.userId)
      .populate({ path: 'establishment', model: 'Establishment' })
      .populate({ path: 'sponsor', model: 'User', select: User.publicFields });

    userUpdated.addKatelleaToken();

    return res.json(userUpdated);
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
    return res.status(INTERNAL_SERVER_ERROR).send();
  }
};


const deleteUser = async (req, res, next) => {
  const user = new User();
  user.firstName = 'Utilisateur';
  user.lastName = 'supprimé';
  user.email = '';
  user.lastDonationDate = null;
  user.lastDonationType = null;
  user.donationPreference = null;
  user.plateletActive = null;
  user.lastNotificationReadDate = null;
  user.minimumDate = null;
  user.bloodType = null;
  user.firstVisit = null;
  user.minimumDate = null;
  user.sponsorToken = null;
  user.katelleaToken = null;
  user.gender = null;

  try {
    await User.findOneAndUpdate({ _id: req.userId }, user);
    res.send('User deleted');
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
    return res.status(INTERNAL_SERVER_ERROR).send();
  }
};


// Routes
userRoutes.get('/:id', getUser);
userRoutes.get('/sponsor/:token', getSponsorUser);
userRoutes.post('/', createUser);
userRoutes.put('/update-notification-read-date', updateNotificationReadDate);
userRoutes.put('/', updateUser);
userRoutes.delete('/', deleteUser);

export default userRoutes;
