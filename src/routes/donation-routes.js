import express from 'express';
import dayjs from 'dayjs';

import Donation from '../models/donation';
import User from '../models/user';

import { DONATION_EVENTS, DONATION_STATUS, DONATION_VISIBILITY, POLL_ANSWERS, NOTIFICATION_TYPES } from '../constants';
import { wellFormedPollAnswers, notifyCreatorNetwork } from '../helpers/donation.helper';

import { injectUserFromToken } from '../middlewares/inject-user-from-token';
import { canAccessDonation, canEditAsCreator, isUserCurrentDonation } from '../middlewares/can-access-donation';
import { INTERNAL_SERVER_ERROR, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED, OK } from 'http-status-codes';
import { generateRandomString } from '../helpers/string.helper';
import { getSmallNetworkIds, getCloseNetworkIds } from '../helpers/user.helper';
import MailFactory from '../services/mail.service';
import { createNotification } from '../helpers/notification.helper';
import sanitize from 'sanitize-html';
import logger from '../services/logger.service';


const donationRoutes = express.Router();
donationRoutes.use(injectUserFromToken);

const getDonationById = async id => {
  return Donation.findById(id)
    .populate({ path: 'establishment', model: 'Establishment' })
    .populate({ path: 'createdBy', model: 'User', select: User.publicFields })
    .populate({ path: 'events.author', model: 'User', select: User.publicFields })
    .populate({ path: 'pollAnswers.author', model: 'User', select: User.publicFields })
    .populate({ path: 'finalAttendees', model: 'User', select: User.publicFields });
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
  const smallNetworkIds = await getSmallNetworkIds(req.user, false);
  const closeNetworkIds = await getCloseNetworkIds(req.user, false);

  const donations = await Donation.find({
    status: DONATION_STATUS.POLL_ON_GOING,
    $or: [
      { visibility: DONATION_VISIBILITY.PUBLIC },
      { visibility: DONATION_VISIBILITY.SMALL_NETWORK, createdBy: { $in: smallNetworkIds } },
      { visibility: DONATION_VISIBILITY.CLOSE_NETWORK, createdBy: { $in: closeNetworkIds } },
    ]
  }, Donation.publicFieldsAsArray)
    .populate({ path: 'establishment', model: 'Establishment' })
    .populate({ path: 'createdBy', model: 'User', select: User.publicFieldsWithToken });

  return res.json(donations);
};


const getDonationHistory = async (req, res) => {
  const donations = await Donation.find({
    status: { $in: [DONATION_STATUS.DONE, DONATION_STATUS.STATISTICS] },
    finalAttendees: req.userId
  }, Donation.publicFieldsAsArray)
    .populate({ path: 'establishment', model: 'Establishment' })
    .populate({ path: 'createdBy', model: 'User', select: User.publicFieldsWithToken });

  return res.json(donations);
};


const getDonationByToken = async (req, res) => {
  const donation = await Donation.findOne({ donationToken: req.params.donationToken }, Donation.publicFieldsAsArray)
    .populate({ path: 'establishment', model: 'Establishment' })
    .populate({ path: 'createdBy', model: 'User', select: User.publicFieldsWithToken });

  if (!donation) return res.status(NOT_FOUND).send();

  return res.json(donation);
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
  donation.status = DONATION_STATUS.POLL_ON_GOING;
  donation.visibility = DONATION_VISIBILITY.SMALL_NETWORK; // Force value ...for now
  donation.mobileCollect = req.body.mobileCollect ? sanitize(req.body.mobileCollect) : null;
  donation.establishment = req.body.establishmentId;
  donation.donationType = req.body.donationType;
  donation.pollSuggestions = req.body.pollSuggestions;
  donation.donationToken = generateRandomString(15); // TODO: check if donationToken not already in use
  donation.createdBy = req.userId;

  // Add CREATE event
  donation.events.push({ name: DONATION_EVENTS.CREATE_DONATION, author: req.userId, date: new Date() });

  // Generate 'YES' pollAnswers for creator for all pollSuggestions
  donation.pollAnswers = [{
    author: req.userId,
    answers: donation.pollSuggestions.map(() => POLL_ANSWERS.YES)
  }];

  try {
    await donation.save();
    const donationCreated = await getDonationById(donation._id);

    // Notify his network that user created a new donation
    notifyCreatorNetwork(donationCreated);

    return res.json(donationCreated);
  } catch (err) {
    logger.error(err.message);
    res.status(INTERNAL_SERVER_ERROR).send();
  }

};


const updateDonation = async (req, res) => {
  const donation = await Donation.findById(req.params.donationId);
  if (!donation) return res.status(BAD_REQUEST).send();

  // Check access
  const canAccess = await canAccessDonation(donation, req.user);
  if (!canAccess) return res.status(NOT_FOUND).send();

  // Is donation can still be updated ?
  if (donation.statisticsDate) {
    const maxDate = dayjs(donation.statisticsDate);
    const today = dayjs();
    if (today.isAfter(maxDate)) return res.status(UNAUTHORIZED).send();
  }

  let isPollClosing = false;
  let isAddingDefinitiveDate = false;

  if (canEditAsCreator(donation, req.user)) {
    // Determine event
    isPollClosing = (donation.status == DONATION_STATUS.POLL_ON_GOING && req.body.status == DONATION_STATUS.POLL_ENDED);
    isAddingDefinitiveDate = (donation.status == DONATION_STATUS.POLL_ENDED && req.body.status == DONATION_STATUS.DATE_CONFIRMED);


    donation.status = req.body.status || donation.status;
    donation.mobileCollect = req.body.mobileCollect || donation.mobileCollect;
    donation.finalDate = new Date(req.body.finalDate) || donation.finalDate;
    donation.finalAttendees = req.body.finalAttendees || donation.finalAttendees;
  }

  try {
    await donation.save();
    const donationUpdated = await getDonationById(req.params.donationId);

    // Handle notification, emails and events
    if (isPollClosing) {
      donation.events.push({ name: DONATION_EVENTS.CLOSE_POLL, author: req.userId, date: new Date() });

      // Warn attendees that the poll is closed
      const attendees = donation.pollAnswers.map(pa => pa.author).filter(id => id !== donation.createdBy);
      attendees.forEach(attendee => createNotification({
        name: NOTIFICATION_TYPES.CLOSE_POLL_TO_YOUR_CURRENT_DONATION, forUser: attendee, date: new Date(), donationId: donation.id
      }));
    }

    if (isAddingDefinitiveDate) {
      donation.events.push({ name: DONATION_EVENTS.SCHEDULE_DONATION, author: req.userId, date: new Date() });
      MailFactory.sendAttendeeMail(donationUpdated);

      // Warn attendees that the donation is scheduled
      const attendees = donation.pollAnswers.map(pa => pa.author).filter(id => id !== donation.createdBy);
      attendees.forEach(attendee => createNotification({
        name: NOTIFICATION_TYPES.FINAL_DATE_TO_YOUR_CURRENT_DONATION, forUser: attendee, date: new Date(), donationId: donation.id
      }));
    }

    return res.json(donationUpdated);
  } catch (err) {
    logger.error(err.message);
    res.status(INTERNAL_SERVER_ERROR).send();
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
    logger.error(err.message);
    res.status(INTERNAL_SERVER_ERROR).send();
  }
};


const deleteDonation = async (req, res) => {

};


// POLL ANSWER
const createPollAnswer = async (req, res) => {
  const donation = await Donation.findById(req.params.donationId);
  if (!donation) return res.status(BAD_REQUEST).send();

  // Check access
  const canAccess = await canAccessDonation(donation, req.user);
  if (!canAccess) return res.status(NOT_FOUND).send();


  if (!req.body || !req.body.answers) return res.status(BAD_REQUEST).send();
  if (!wellFormedPollAnswers(donation, req.body.answers)) return res.status(BAD_REQUEST).send();

  // Remove _ids
  const currentResponses = donation.pollAnswers.map(ans => ({ 'author': ans.author, 'answers': ans.answers }));
  currentResponses.push({ author: req.userId, answers: req.body.answers });
  donation.pollAnswers = currentResponses;

  donation.events.push({ name: DONATION_EVENTS.ADD_POLL_ANSWER, author: req.userId, date: new Date() });
  donation.notifyCreator(NOTIFICATION_TYPES.SOMEONE_ADD_POLL_ANSWER_TO_YOUR_DONATION, req.userId);

  try {
    await donation.save();
    const donationUpdated = await getDonationById(req.params.donationId);
    return res.json(donationUpdated);
  } catch (err) {
    logger.error(err.message);
    res.status(INTERNAL_SERVER_ERROR).send();
  }
};


const updatePollAnswer = async (req, res) => {
  const donation = await Donation.findById(req.params.donationId);
  if (!donation) return res.status(BAD_REQUEST).send();
  if (!req.body || !req.body.answers) return res.status(BAD_REQUEST).send();

  if (!wellFormedPollAnswers(donation, req.body.answers)) return res.status(BAD_REQUEST).send();

  // Check access
  const canAccess = await canAccessDonation(donation, req.user);
  if (!canAccess) return res.status(NOT_FOUND).send();


  const pollAnswerIndex = donation.pollAnswers.findIndex(pa => pa.author === req.userId);
  const newPollAnswers = donation.pollAnswers;
  newPollAnswers[pollAnswerIndex].answers = req.body.answers;
  donation.pollAnswers = newPollAnswers;

  // Add UPDATE_POLL_ANSWER event
  // If the last UPDATE_POLL_ANSWER come from the same user during the last hour, we only update the event date (to avoid event 'spamming')
  const lastEvent = donation.events[donation.events.length - 1];
  const todayMinusOneHour = dayjs().subtract(1, 'hour');
  const lastEventDate = dayjs(lastEvent.date);
  if (lastEvent.name === DONATION_EVENTS.UPDATE_POLL_ANSWER && lastEvent.author === req.userId && lastEventDate.isAfter(todayMinusOneHour)) {
    const updatedEvents = donation.events;
    updatedEvents[donation.events.length - 1].date = new Date();
    donation.events = updatedEvents;
  } else {
    donation.events.push({ name: DONATION_EVENTS.UPDATE_POLL_ANSWER, author: req.userId, date: new Date() });
    donation.notifyCreator(NOTIFICATION_TYPES.SOMEONE_UPDATE_POLL_ANSWER_TO_YOUR_DONATION, req.userId);
  }

  try {
    await donation.save();

    const donationUpdated = await getDonationById(req.params.donationId);

    return res.json(donationUpdated);
  } catch (err) {
    logger.error(err.message);
    res.status(INTERNAL_SERVER_ERROR).send();
  }
};


// COMMENT
const addComment = async (req, res) => {
  const donation = await Donation.findById(req.params.donationId);
  if (!donation) return res.status(BAD_REQUEST).send();

  // Check access
  const canAccess = await canAccessDonation(donation, req.user);
  if (!canAccess) return res.status(NOT_FOUND).send();

  if (!req.body || !req.body.comment) return res.status(BAD_REQUEST).send();

  donation.events.push({ name: DONATION_EVENTS.ADD_COMMENT, author: req.userId, comment: req.body.comment, date: new Date() });
  donation.notifyCreator(NOTIFICATION_TYPES.SOMEONE_ADD_COMMENT_TO_YOUR_DONATION, req.userId);

  try {
    await donation.save();
    const donationUpdated = await getDonationById(req.params.donationId);
    return res.json(donationUpdated);
  } catch (err) {
    logger.error(err.message);
    res.status(INTERNAL_SERVER_ERROR).send();
  }
};


const updateComment = async (req, res) => {
  const donation = await Donation.findById(req.params.donationId);
  if (!donation) return res.status(BAD_REQUEST).send();

  // Check access
  const canAccess = await canAccessDonation(donation, req.user);
  if (!canAccess) return res.status(NOT_FOUND).send();

  if (!req.body || !req.body.comment) return res.status(BAD_REQUEST).send();

  const newEvents = donation.events.map(event => {
    if (event.name == DONATION_EVENTS.ADD_COMMENT && event._id == req.params.commentId) {
      event.comment = req.body.comment;
      event.data = { updated: true };
      return event;
    } else return event;
  });
  donation.events = newEvents;


  try {
    await donation.save();
    const donationUpdated = await getDonationById(req.params.donationId);
    return res.json(donationUpdated);
  } catch (err) {
    logger.error(err.message);
    res.status(INTERNAL_SERVER_ERROR).send();
  }
};

// Routes => Donation
donationRoutes.get('/eligible-donations', getEligibleDonations);
donationRoutes.get('/history', getDonationHistory);
donationRoutes.get('/:donationId', getDonation);
donationRoutes.get('/token/:donationToken', getDonationByToken);
donationRoutes.get('/can-access/token/:donationToken', canAccessDonationByToken);
donationRoutes.post('/:donationId/remove-user/:userId', addQuitUserEvent);
donationRoutes.post('/', createDonation);
donationRoutes.put('/:donationId', updateDonation);
donationRoutes.delete('/:donationId', deleteDonation);

// Routes => pollAnswers
donationRoutes.post('/:donationId/poll-answer', createPollAnswer);
donationRoutes.put('/:donationId/poll-answer', updatePollAnswer);

// Routes => comment
donationRoutes.post('/:donationId/comment', addComment);
donationRoutes.put('/:donationId/comment/:commentId', updateComment);

export default donationRoutes;
