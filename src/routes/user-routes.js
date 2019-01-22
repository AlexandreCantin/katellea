import express from 'express';
import dayjs from 'dayjs';
import sanitize from 'sanitize-html';

import { injectUserFromToken } from '../middlewares/inject-user-from-token';

import { DONATION_TYPE, DONATION_REST_WEEKS, BLOOD_COMPATIBILITY } from '../constants';
import { UNAUTHORIZED, NOT_FOUND, INTERNAL_SERVER_ERROR, OK, BAD_REQUEST, FORBIDDEN } from 'http-status-codes';

import User from '../models/user';
import Donation from '../models/donation';
import { canAccessDonation } from '../middlewares/can-access-donation';

import { addWeeksToDate } from '../helpers/date.helper';
import { EmailVerificationService } from '../services/email-verification.service';
import { UserService } from '../services/user.service';
import { sendError } from '../helper';
import { environment } from '../../conf/environment';


const userRoutes = express.Router();
userRoutes.use(injectUserFromToken);

const getSponsorUser = async (req, res) => {
  const user = await User.findOne({ sponsorToken: req.params.token })
    .select(User.publicFields)
    .populate({ path: 'establishment', model: 'Establishment' }).exec();
  if (user == null) return res.status(NOT_FOUND).send();

  return res.json(user);
};

const getGodchilds = async(req, res) => {
  const godchilds = await User.find({ sponsor: req.userId }).select(User.compatibilityFields);
  let godchildObj = godchilds.map(godchild => godchild.toObject());

  if(req.user.bloodType !== 'UNKNOWN') {
    godchildObj.forEach(godchild => {
      if(godchild.bloodType !== 'UNKNOWN') {
        godchild.compatibility = BLOOD_COMPATIBILITY[req.user.bloodType][godchild.bloodType];
        godchild.bloodType = undefined; // Delete bloodType
      }
    });
  }

  return res.json(godchildObj);
}

const getSponsorUserCompatibility = async (req, res) => {
  if(!req.user.sponsor) return res.json({ direction: '' });

  // Get sponsor
  const sponsor = await User.findOne({ _id: req.user.sponsor });
  if(!sponsor) return res.json({ direction: '' });

  if (req.params.bloodType === 'UNKNOWN' || sponsor.bloodType === 'UNKNOWN') return res.json({ direction: '' });
  return res.json({ direction: BLOOD_COMPATIBILITY[req.params.bloodType][sponsor.bloodType] });
}

const isAdminUser = async (req, res) => {
  if (UserService.isAdmin(req.user)) return res.status(OK).send();
  return res.status(NOT_FOUND).send();
}


/**
 * Set user.emailVerified as true (if token is correct)
 */
const validateUser = async(req, res) => {
  if(!req.params.token) return res.status(NOT_FOUND).send();

  try {
    const userId = await EmailVerificationService.verifyUser(req.params.token);

    const userUpdated = await User.findById(userId)
      .populate({ path: 'establishment', model: 'Establishment' })
      .populate({ path: 'sponsor', model: 'User', select: User.publicFields });

    userUpdated.addKatelleaToken();

    return res.json(userUpdated);
  } catch(err) {
    sendError(err);
    return res.status(BAD_REQUEST).send();
  }
}


const reSendEmailVerificationEmail = async (req, res) => {
  // TODO: check last EmailVerification => avoid spamming
  if(await EmailVerificationService.checkEmailVerificationOnGoing(req.user)) {
    return res.status(FORBIDDEN).send();
  }

  await EmailVerificationService.createEmailVerification(req.user, true);
  return res.status(OK).send();
}


const createUser = async (req, res) => {

  {/* #Beta */}
  const userNumber = await User.countDocuments({});

  if (!req.body.sponsoredByToken && userNumber >= environment.betaLimit) {
    res.status(FORBIDDEN).send();
    return;
  }

  // Check if sponsor exists
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
  user.name = sanitize(req.body.name);

  /**
   * FIXME: With Gmail, dots doesn't matter so a user can create an other account with the same address...
   *        But we can't simply remove the dots because the user can think that its email is wrong...
   *   => https://support.google.com/mail/answer/7436150
   */
  user.email = req.body.email;
  user.emailVerified = false;

  user.gender = req.body.gender;
  user.firstVisit = true;
  user.minimumDate = new Date();
  user.lastNotificationReadDate = new Date();
  user.sponsorToken = await UserService.generateUniqueToken();
  user.sponsor = sponsorId ? sponsorId : undefined;
  user.currentDonation = currentDonationId ? currentDonationId : undefined;

  user.socialNetworkKey = req.body.socialNetworkKey;
  user.godchildNumber = 0;
  user.notificationSettings = {};

  user.bloodDonationDone = 0;
  user.plasmaDonationDone = 0;
  user.plateletDonationDone = 0;


  try {
    await user.save();

    const userCreated = await User.findById(user._id).populate({ path: 'sponsor', model: 'User', select: User.publicFields });
    userCreated.addKatelleaToken();

    // Increment godchildNumber for sponsor
    // Why not before ? because if creating fails we don't want to increase godchildNumber
    if (req.body.sponsoredByToken) {
      const sponsorUser = await User.findOne({ sponsorToken: req.body.sponsoredByToken });
      if (sponsorUser) {
        const godchildNumber = sponsorUser.godchildNumber || 0;
        sponsorUser.godchildNumber = godchildNumber+1;
        sponsorUser.save();
      }
    }

    return res.json(userCreated);
  } catch (err) {
    if(err.errmsg && err.errmsg.startsWith('E11000 duplicate key error')) {
      return res.status(UNAUTHORIZED).send();
    }
    sendError(err);
    return res.status(INTERNAL_SERVER_ERROR).send();
  }
};


const updateNotificationReadDate = async (req, res) => {
  if (!req.body.lastNotificationReadDate) return res.status(UNAUTHORIZED).send();

  try {
    await User.findByIdAndUpdate({ _id: req.userId }, { lastNotificationReadDate: req.body.lastNotificationReadDate });

    return res.status(OK).send();
  } catch (err) {
    sendError(err);
    return res.status(INTERNAL_SERVER_ERROR).send();
  }
};


const updateUser = async (req, res) => {

  const user = req.user.toObject();
  user.name = req.body.name || req.user.name;
  user.email = req.body.email || req.user.email;
  user.lastDonationDate = req.body.lastDonationDate || req.user.lastDonationDate;
  user.lastDonationType = req.body.lastDonationType || req.user.lastDonationType;
  user.donationPreference = req.body.donationPreference || req.user.donationPreference;
  user.plateletActive = req.body.plateletActive || req.user.plateletActive;
  user.notificationSettings = req.body.notificationSettings || req.user.notificationSettings || {};
  user.lastNotificationReadDate = req.body.lastNotificationReadDate || req.user.lastNotificationReadDate;

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
      const currentMinimumDate = dayjs(req.user.minimumDate);
      const minimumDateDueToDonation = addWeeksToDate(user.lastDonationDate, DONATION_REST_WEEKS[user.lastDonationType]);

      if (newMinimumDate.isAfter(minimumDateDueToDonation) || newMinimumDate.isAfter(currentMinimumDate)) user.minimumDate = req.body.minimumDate;
    } else {
      // Default case
      user.minimumDate = req.body.minimumDate;
    }
  }

  if (!user.plateletActive && user.lastDonationType == DONATION_TYPE.PLATELET) user.plateletActive = true;

  user.bloodType = req.body.bloodType || user.bloodType;
  user.establishment = req.body.hasOwnProperty('establishmentId') ? req.body.establishmentId : user.establishment;

  if(user.firstVisit === true) await EmailVerificationService.createEmailVerification(user);
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

    // Start email validation process if mail has been updated
    if(req.body.email && req.body.email != req.user.email) await EmailVerificationService.createEmailVerification(userUpdated, true);

    return res.json(userUpdated);
  } catch (err) {
    sendError(err);
    return res.status(INTERNAL_SERVER_ERROR).send();
  }
};


const deleteUser = async (req, res, next) => {
  const user = new User();
  user.name = 'Utilisateur supprimé';
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
  user.socialNetworkKey = null;

  // Remove sponsor
  if (user.sponsor) {
    const sponsorUser = await User.findById(user.sponsor);
    sponsorUser.godchildNumber = sponsorUser.godchildNumber - 1; // Decrement godchildNumber for sponsor
    sponsorUser.save();
  }

  try {
    await User.findOneAndUpdate({ _id: req.userId }, user);
    res.send('User deleted');
  } catch (err) {
    sendError(err);
    return res.status(INTERNAL_SERVER_ERROR).send();
  }
};


// Routes
userRoutes.post('/is-admin', isAdminUser);
userRoutes.get('/godchilds', getGodchilds);
userRoutes.post('/email-verification/:token', validateUser);
userRoutes.post('/re-send-email-verification', reSendEmailVerificationEmail);
userRoutes.get('/sponsor-compatibility/:bloodType', getSponsorUserCompatibility);
userRoutes.get('/sponsor/:token', getSponsorUser);
userRoutes.post('/', createUser);
userRoutes.put('/update-notification-read-date', updateNotificationReadDate);
userRoutes.put('/', updateUser);
userRoutes.delete('/', deleteUser);

export default userRoutes;
