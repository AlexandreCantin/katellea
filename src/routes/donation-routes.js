import express from 'express';
import dayjs from 'dayjs';

import Donation from '../models/donation';
import User from '../models/user';

import { DONATION_EVENTS, DONATION_STATUS, DONATION_VISIBILITY, POLL_ANSWERS, NOTIFICATION_TYPES } from '../constants';
import { wellFormedPollAnswers, notifyCreatorNetwork, sendDonationAdminMail } from '../helpers/donation.helper';

import { injectUserFromToken } from '../middlewares/inject-user-from-token';
import { canAccessDonation, canEditAsCreator, isUserCurrentDonation, canBeUpdated } from '../middlewares/can-access-donation';
import { INTERNAL_SERVER_ERROR, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED, OK } from 'http-status-codes';
import MailFactory from '../services/mail.service';
import { createNotification } from '../helpers/notification.helper';
import sanitize from 'sanitize-html';
import { DonationService } from '../services/donation.service';
import { SlackService } from '../services/slack.service';
import { sendError } from '../helper';
import { generateRandomString } from '../helpers/string.helper';
import { getNetworkIds } from '../helpers/user.helper';


const donationRoutes = express.Router();
donationRoutes.use(injectUserFromToken);

const getDonationById = async id => {
  return Donation.findById(id, Donation.publicFieldsAsArray)
    .populate({ path: 'establishment', model: 'Establishment' })
    .populate({ path: 'createdBy', model: 'User', select: User.publicFields })
    .populate({ path: 'events.author', model: 'User', select: User.publicFields })
    .populate({ path: 'pollAnswers.author', model: 'User', select: User.publicFields })
    .populate({ path: 'finalAttendeesUser', model: 'User', select: User.publicFields });
};

const _getDonationByToken = async token => {
  return Donation.findOne({ donationToken: token, status: { $ne: DONATION_STATUS.STATISTICS } }, Donation.publicFieldsAsArray)
    .populate({ path: 'establishment', model: 'Establishment' })
    .populate({ path: 'createdBy', model: 'User', select: User.publicFields })
    .populate({ path: 'events.author', model: 'User', select: User.publicFields })
    .populate({ path: 'pollAnswers.author', model: 'User', select: User.publicFields })
    .populate({ path: 'finalAttendeesUser', model: 'User', select: User.publicFields });
};


/** Get donation with fields filter for user */
const getDonationByToken = async (req, res) => {
  const donation = await _getDonationByToken(req.params.donationToken);
  if (!donation) return res.status(NOT_FOUND).send();
  return res.json(donation);
};

const isDonationAdmin = async (req, res) => {
  const donation = await Donation.findOne({ donationToken: req.params.donationToken });
  if (!donation) return res.status(NOT_FOUND).send();

  if(req.params.adminToken && donation.adminToken === req.params.adminToken) return res.status(OK).send();
  return res.status(UNAUTHORIZED).send();
};


// DONATION
const getDonation = async (req, res) => {
  const donation = await getDonationById(req.params.donationId);
  if (!donation) return res.status(NOT_FOUND).send();

  // Check access
  const canAccess = await canAccessDonation(donation, req.user);
  if (!canAccess) return res.status(NOT_FOUND).send();

  return res.json(donation);
};


const getEligibleDonations = async (req, res) => {
  const networkIds = getNetworkIds(req.user, false);

  const donations = await Donation.find({
    status: DONATION_STATUS.POLL_ON_GOING,
    $or: [
      { visibility: DONATION_VISIBILITY.PRIVATE, createdBy: { $in: networkIds } },
    ]
  }, Donation.publicFieldsAsArray)
    .populate({ path: 'establishment', model: 'Establishment' })
    .populate({ path: 'createdBy', model: 'User', select: User.publicFieldsWithToken });

  return res.json(donations);
};

const getDonationHistory = async (req, res) => {
  const donations = await Donation.find({
    status: { $in: [DONATION_STATUS.DONE, DONATION_STATUS.STATISTICS] },
    finalAttendeesUser: req.userId
  }, Donation.historyFieldsAsArray)
    .populate({ path: 'establishment', model: 'Establishment' })
    .populate({ path: 'createdBy', model: 'User', select: User.publicFieldsWithToken });

  return res.json(donations);
};


const canAccessDonationByToken = async (req, res) => {
  const donation = await Donation.findOne({ donationToken: req.params.donationToken }, Donation.publicFieldsAsArray)
    .populate({ path: 'createdBy', model: 'User', select: User.publicFieldsWithToken });

  if (!donation) return res.status(NOT_FOUND).send();

  // Check access
  const canAccess = await canAccessDonation(donation, req.user);
  if (!canAccess) return res.status(UNAUTHORIZED).send();

  return res.status(OK).send();
};


const createDonation = async (req, res) => {

  const donation = new Donation();
  donation.isPublicDonation = req.body.isPublicDonation;
  donation.status = DONATION_STATUS.POLL_ON_GOING;
  donation.visibility = DONATION_VISIBILITY.PUBLIC; // One day, friends only
  donation.mobileCollect = req.body.mobileCollect ? sanitize(req.body.mobileCollect) : null;
  donation.establishment = req.body.establishmentId;
  donation.donationType = req.body.donationType;
  donation.pollSuggestions = req.body.pollSuggestions;
  donation.donationToken = await DonationService.generateUniqueToken();
  donation.adminToken = generateRandomString(15);

  if(donation.isPublicDonation) {
    const name = sanitize(req.body.createdByGuest.name);
    const email = sanitize(req.body.createdByGuest.email);
    // Not register user
    donation.events.push({ name: DONATION_EVENTS.CREATE_DONATION, username: name, date: new Date() });
    donation.createdByGuest = { name, email }

    donation.acceptEligibleMail = req.body.acceptEligibleMail || false;

    // Generate 'YES' pollAnswers for creator for all pollSuggestions
    donation.pollAnswers = [{
      username: name,
      answers: donation.pollSuggestions.map(() => POLL_ANSWERS.YES)
    }];
  } else {
    // Register user
    donation.events.push({ name: DONATION_EVENTS.CREATE_DONATION, author: req.userId, date: new Date() });
    donation.createdBy = req.userId;

    // Generate 'YES' pollAnswers for creator for all pollSuggestions
    donation.pollAnswers = [{
      author: req.userId,
      answers: donation.pollSuggestions.map(() => POLL_ANSWERS.YES)
    }];
  }



  try {
    const donationFullObject =  await donation.save(); // All fields
    const donationCreated = await _getDonationByToken(donation.donationToken); // Only public fields

    SlackService.sendDonationCreated(donationCreated);

    // Notify his network that user created a new donation
    if(!donation.isPublicDonation) notifyCreatorNetwork(donation);
    if(donation.isPublicDonation) sendDonationAdminMail(req.body.createdByGuest, donation);

    // Add admin token (for frontend redirect as admin)
    const donationObj = donationCreated.toObject();
    donationObj.adminToken = donationFullObject.adminToken;

    return res.json(donationObj);
  } catch (err) {
    sendError(err);
    return res.status(INTERNAL_SERVER_ERROR).send();
  }

};


const resetPoll = async (req, res) => {
  const donation = await Donation.findOne({ donationToken: req.params.donationToken });
  if (!donation) return res.status(BAD_REQUEST).send();

  // Check access
  const canAccess = await canAccessDonation(donation, req.user);
  if (!canAccess) return res.status(NOT_FOUND).send();

  if(!canEditAsCreator(donation, req.user, req.query.adminToken)) return res.status(UNAUTHORIZED).send();
  if (!canBeUpdated(donation) || donation.status !== DONATION_STATUS.POLL_ON_GOING) return res.status(UNAUTHORIZED).send();

  // Update all pollSugestions
  donation.pollSuggestions = req.body.pollSuggestions;
  if(donation.isPublicDonation) {
    const username = donation.createdByGuest.name;

    donation.events.push({ name: DONATION_EVENTS.RESET_POLL, username, date: new Date() });
    donation.pollAnswers = [{ username, answers: donation.pollSuggestions.map(() => POLL_ANSWERS.YES) }];
  } else {
    donation.events.push({ name: DONATION_EVENTS.RESET_POLL, author: req.userId, date: new Date() });
    donation.pollAnswers = [{ author: req.userId, answers: donation.pollSuggestions.map(() => POLL_ANSWERS.YES) }];
  }

  try {
    await donation.save();
    const donationUpdated = await _getDonationByToken(req.params.donationToken);
    return res.json(donationUpdated);
  } catch (err) {
    sendError(err);
    return res.status(INTERNAL_SERVER_ERROR).send();
  }
}


const updateDonation = async (req, res) => {
  const donation = await Donation.findOne({ donationToken: req.params.donationToken });
  if (!donation) return res.status(BAD_REQUEST).send();

  // Check access
  const canAccess = await canAccessDonation(donation, req.user);
  if (!canAccess) return res.status(NOT_FOUND).send();

  if(!canEditAsCreator(donation, req.user, req.query.adminToken)) return res.status(UNAUTHORIZED).send();
  if (!canBeUpdated(donation)) return res.status(UNAUTHORIZED).send();


  // Determine event
  const isPollClosing = (donation.status == DONATION_STATUS.POLL_ON_GOING && req.body.status == DONATION_STATUS.POLL_ENDED);
  const isAddingDefinitiveDate = (donation.status == DONATION_STATUS.POLL_ENDED && req.body.status == DONATION_STATUS.DATE_CONFIRMED);

  donation.status = req.body.status || donation.status;
  donation.mobileCollect = req.body.mobileCollect || donation.mobileCollect;
  donation.finalDate = new Date(req.body.finalDate) || donation.finalDate;

  donation.finalAttendeesUser = req.body.finalAttendeesUser || donation.finalAttendeesUser;
  donation.finalAttendeesGuest = req.body.finalAttendeesGuest || donation.finalAttendeesGuest;


  if (isPollClosing) {
    const data = { name: DONATION_EVENTS.CLOSE_POLL, date: new Date() };
    if(req.userId) { data.author = req.userId; } else { data.username = donation.createdByGuest.name; }
    donation.events.push(data);
  }

  if (isAddingDefinitiveDate) {
    const data = { name: DONATION_EVENTS.SCHEDULE_DONATION, date: new Date(), data: { date: donation.finalDate } };
    if(req.userId) { data.author = req.userId; } else { data.username = donation.createdByGuest.name; }
    donation.events.push(data);
  }

  try {
    await donation.save();
    const donationUpdated = await _getDonationByToken(req.params.donationToken);

    // Handle notification and emails
    const creatorId = donation.createdBy || 0;

    if (isPollClosing) {
      // Warn user attendees that the poll is closed
      const attendees = donation.pollAnswers.filter(pa => pa.author != undefined).map(pa => pa.author).filter(id => id !== creatorId);
      attendees.forEach(attendee => createNotification({
        name: NOTIFICATION_TYPES.CLOSE_POLL_TO_YOUR_CURRENT_DONATION, author: req.userId, username: donation.createdByGuest.name, forUser: attendee, date: new Date(), donationId: donation.id
      }));
    }

    if (isAddingDefinitiveDate) {
      MailFactory.sendAttendeeMail(donationUpdated);

      // Warn attendees that the donation is scheduled
      const attendees = donation.pollAnswers.filter(pa => pa.author != undefined).map(pa => pa.author).filter(id => id !== creatorId);
      attendees.forEach(attendee => createNotification({
        name: NOTIFICATION_TYPES.FINAL_DATE_TO_YOUR_CURRENT_DONATION, author: req.userId, username: donation.createdByGuest.name, forUser: attendee, date: new Date(), donationId: donation.id
      }));
    }

    return res.json(donationUpdated);
  } catch (err) {
    sendError(err);
    return res.status(INTERNAL_SERVER_ERROR).send();
  }
};


const addQuitUserEvent = async (req, res) => {
  const donation = await Donation.findById(req.params.donationId);
  if (!donation) return res.status(BAD_REQUEST).send();

  // Check access
  const canAccess = await canAccessDonation(donation, req.user);
  if (!canAccess) return res.status(NOT_FOUND).send();

  // Is user currentDonation ?
  if (!isUserCurrentDonation(donation, req.user)) return res.status(NOT_FOUND).send();

  donation.events.push({ name: DONATION_EVENTS.QUIT, author: req.userId, comment: req.body.comment, date: new Date() });
  donation.notifyCreator(NOTIFICATION_TYPES.SOMEONE_QUIT_YOUR_DONATION, req.userId);

  try {
    await donation.save();

    const donationUpdated = await getDonationById(req.params.donationId);

    return res.json(donationUpdated);
  } catch (err) {
    sendError(err);
    return res.status(INTERNAL_SERVER_ERROR).send();
  }
};


const deleteDonation = async (req, res) => {
  const donation = await Donation.findOne({ donationToken: req.params.donationToken });
  if (!donation) return res.status(BAD_REQUEST).send();

  // Check access
  const canAccess = await canAccessDonation(donation, req.user);
  if (!canAccess) return res.status(NOT_FOUND).send();

  if(!canEditAsCreator(donation, req.user, req.query.adminToken)) return res.status(UNAUTHORIZED).send();

  try {
    await Donation.deleteOne({ donationToken: req.params.donationToken });

    // Delete all users with current donation is the donations
    const users = User.find({ currentDonationToken: req.params.donationToken });
    users.forEach((user) => { user.currentDonationToken = null; user.save(); });

    return res.status(OK).send();
  } catch(err) {
    sendError(err);
  }
  return res.status(INTERNAL_SERVER_ERROR).send();
};


// POLL ANSWER
const createPollAnswer = async (req, res) => {
  const donation = await Donation.findOne({ donationToken: req.params.donationToken });
  if (!donation) return res.status(BAD_REQUEST).send();

  // Check access
  const canAccess = await canAccessDonation(donation, req.user);
  if (!canAccess) return res.status(NOT_FOUND).send();


  if (!req.body || !req.body.answers) return res.status(BAD_REQUEST).send();
  if (!wellFormedPollAnswers(donation, req.body.answers)) return res.status(BAD_REQUEST).send();

  // Remove _ids
  const currentResponses = donation.pollAnswers.map(ans => ({ 'author': ans.author, 'username': ans.username, 'answers': ans.answers }));

  if(!req.user) {
    if(!req.body.username) return res.status(BAD_REQUEST).send();

    const username = sanitize(req.body.username)
    currentResponses.push({ username, answers: req.body.answers });
    donation.events.push({ name: DONATION_EVENTS.ADD_POLL_ANSWER, username, date: new Date() });
  } else {
    currentResponses.push({ author: req.userId, answers: req.body.answers });
    donation.events.push({ name: DONATION_EVENTS.ADD_POLL_ANSWER, author: req.userId, date: new Date() });

    // Set donation as current for User
    const user = req.user.toObject();
    user.currentDonationToken = req.params.donationToken;
    await User.findOneAndUpdate({ _id: req.userId }, user);
  }
  donation.pollAnswers = currentResponses;

  const name = req.user ? req.user.name : sanitize(req.body.username);
  donation.notifyCreator(NOTIFICATION_TYPES.SOMEONE_ADD_POLL_ANSWER_TO_YOUR_DONATION, name, req.userId);

  try {
    await donation.save();
    const donationUpdated = await _getDonationByToken(req.params.donationToken);
    return res.json(donationUpdated);
  } catch (err) {
    sendError(err);
    return res.status(INTERNAL_SERVER_ERROR).send();
  }
};


const updatePollAnswer = async (req, res) => {
  const donation = await Donation.findOne({ donationToken: req.params.donationToken });
  if (!donation) return res.status(BAD_REQUEST).send();
  if (!req.body || !req.body.answers) return res.status(BAD_REQUEST).send();

  if (!wellFormedPollAnswers(donation, req.body.answers)) return res.status(BAD_REQUEST).send();

  // Check access
  const canAccess = await canAccessDonation(donation, req.user);
  if (!canAccess) return res.status(NOT_FOUND).send();

  let pollAnswerIndex;
  if(req.userId) {
    pollAnswerIndex = donation.pollAnswers.findIndex(pa => pa.author === req.userId);
  } else {
    if(!req.body.id) return res.status(BAD_REQUEST).send();
    pollAnswerIndex = donation.pollAnswers.findIndex(pa => pa.id === req.body.id);
    donation.events.push({ name: DONATION_EVENTS.UPDATE_POLL_ANSWER, username: req.body.username, date: new Date() });

  }

  const newPollAnswers = donation.pollAnswers;
  newPollAnswers[pollAnswerIndex].answers = req.body.answers;
  donation.pollAnswers = newPollAnswers;

  // Add UPDATE_POLL_ANSWER event
  // If the last UPDATE_POLL_ANSWER come from the same user during the last hour, we only update the event date (to avoid event 'spamming')
  const lastEvent = donation.events[donation.events.length - 1];
  const todayMinusOneHour = dayjs().subtract(1, 'hour');
  const lastEventDate = dayjs(lastEvent.date);

  if (lastEvent.name === DONATION_EVENTS.UPDATE_POLL_ANSWER && (lastEvent.author === req.userId || req.body.username == lastEvent.username) && lastEventDate.isAfter(todayMinusOneHour)) {
    const updatedEvents = donation.events;
    updatedEvents[donation.events.length - 1].date = new Date();
    donation.events = updatedEvents;
  } else {
    // Not logged user
    if(req.body.username) {
      donation.notifyCreator(NOTIFICATION_TYPES.SOMEONE_UPDATE_POLL_ANSWER_TO_YOUR_DONATION, req.body.username);
      if(req.body.username !== donation.createdByGuest.name) donation.notifyCreator(NOTIFICATION_TYPES.SOMEONE_UPDATE_POLL_ANSWER_TO_YOUR_DONATION, '', req.userId);
    } else {
      // Log user
      donation.events.push({ name: DONATION_EVENTS.UPDATE_POLL_ANSWER, author: req.userId, date: new Date() });
      donation.notifyCreator(NOTIFICATION_TYPES.SOMEONE_UPDATE_POLL_ANSWER_TO_YOUR_DONATION, undefined, req.userId);
    }
  }

  try {
    await donation.save();
    const donationUpdated = await _getDonationByToken(req.params.donationToken);
    return res.json(donationUpdated);
  } catch (err) {
    sendError(err);
    return res.status(INTERNAL_SERVER_ERROR).send();
  }
};


// COMMENT
const addComment = async (req, res) => {
  const donation = await Donation.findOne({ donationToken: req.params.donationToken });
  if (!donation) return res.status(BAD_REQUEST).send();

  // Check access
  const canAccess = await canAccessDonation(donation, req.user);
  if (!canAccess) return res.status(NOT_FOUND).send();

  if (!req.body || !req.body.comment) return res.status(BAD_REQUEST).send();

  const comment = sanitize(req.body.comment)
  if(!req.user) {
    if(!req.body.username) return res.status(BAD_REQUEST).send();

    const username = sanitize(req.body.username);
    donation.events.push({ name: DONATION_EVENTS.ADD_COMMENT, username: username, comment, date: new Date() });
  } else {
    donation.events.push({ name: DONATION_EVENTS.ADD_COMMENT, author: req.userId, comment, date: new Date() });
  }

  const name = req.user ? req.user.name : sanitize(req.body.username);
  donation.notifyCreator(NOTIFICATION_TYPES.SOMEONE_ADD_COMMENT_TO_YOUR_DONATION, name, req.userId);

  try {
    await donation.save();
    const donationUpdated = await _getDonationByToken(req.params.donationToken);
    return res.json(donationUpdated);
  } catch (err) {
    sendError(err);
    return res.status(INTERNAL_SERVER_ERROR).send();
  }
};


const updateComment = async (req, res) => {
  const donation = await Donation.findOne({ donationToken: req.params.donationToken });
  if (!donation) return res.status(BAD_REQUEST).send();

  // Check access
  const canAccess = await canAccessDonation(donation, req.user);
  if (!canAccess) return res.status(NOT_FOUND).send();

  if (!req.body || !req.body.comment) return res.status(BAD_REQUEST).send();

  let didUpdate = false;
  const newEvents = donation.events.map(event => {
    if (event.name == DONATION_EVENTS.ADD_COMMENT && event._id == req.body.commentId && event.author.id == req.userId) {
      event.comment = req.body.comment;
      event.data = { updated: true };

      if(didUpdate === false) didUpdate = true;

      return event;
    } else return event;
  });
  // If no comment to update found
  if(!didUpdate) return res.status(BAD_REQUEST).send();

  donation.events = newEvents;

  try {
    await donation.save();
    const donationUpdated = await _getDonationByToken(req.params.donationToken);
    return res.json(donationUpdated);
  } catch (err) {
    sendError(err);
    return res.status(INTERNAL_SERVER_ERROR).send();
  }
};

// Routes => Donation
donationRoutes.get('/eligible-donations', getEligibleDonations);
donationRoutes.get('/history', getDonationHistory);

donationRoutes.get('/id/:donationId', getDonation);
donationRoutes.get('/token/:donationToken', getDonationByToken);
donationRoutes.get('/:donationToken/is-admin/:adminToken', isDonationAdmin);

donationRoutes.get('/can-access/token/:donationToken', canAccessDonationByToken);
donationRoutes.post('/:donationId/remove-user/:userId', addQuitUserEvent);
donationRoutes.post('/', createDonation);
donationRoutes.put('/:donationToken', updateDonation);
donationRoutes.put('/reset-poll/:donationToken', resetPoll);
donationRoutes.delete('/:donationToken', deleteDonation);

// Routes => pollAnswers
donationRoutes.post('/:donationToken/poll-answer', createPollAnswer);
donationRoutes.put('/:donationToken/poll-answer', updatePollAnswer);

// Routes => comment
donationRoutes.post('/:donationToken/comment', addComment);
donationRoutes.put('/:donationToken/comment/:commentId', updateComment);

export default donationRoutes;
