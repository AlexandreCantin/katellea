import { POLL_ANSWERS, DONATION_VISIBILITY, NOTIFICATION_TYPES } from '../constants';
import { getSmallNetworkIds, getCloseNetworkIds } from './user.helper';
import dayjs from 'dayjs';
import User from '../models/user';
import MailFactory from '../services/mail.service';
import { createNotification } from './notification.helper';
import { environment } from '../../conf/environment';

export const wellFormedPollAnswers = (donation, answers) => {
  // Too much or not enough answers
  if (donation.pollSuggestions.length != answers.length) return false;

  // Some answers have wrong values ?
  const expectedValues = Object.values(POLL_ANSWERS);
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[0];
    if (!expectedValues.includes(answer)) return false;
  }

  return true;
};

export const notifyCreatorNetwork = async donation => {
  const WEEKS_DELAY_BEFORE_ELIGIBILITY = environment.weeksDelayBeforeEligibilty;

  // Compute ids
  let ids = [];
  const creatorId = donation.createdBy._id;
  if (donation.visibility === DONATION_VISIBILITY.SMALL_NETWORK || donation.visibility === DONATION_VISIBILITY.PUBLIC) {
    ids = await getSmallNetworkIds(creatorId, false);
  } else if (donation.visibility === DONATION_VISIBILITY.CLOSE_NETWORK) {
    ids = await getCloseNetworkIds(creatorId, false);
  }
  if (ids.length === 0) return;

  // Get oldest date and add 3 weeks => if user is eligible to the oldest date, he is eligible to the donation
  const oldestPollSuggestion = donation.pollSuggestions.reduce((ps, currentOldDate) => dayjs(ps.date).isAfter(dayjs(currentOldDate)) ? ps.date : currentOldDate);
  const maximumDate = dayjs(oldestPollSuggestion.date).add(WEEKS_DELAY_BEFORE_ELIGIBILITY, 'week');

  // Compute request
  const users = await User.find({
    _id: { $in: ids },
    currentDonation: { $exists: false },
    minimumDate: { $lte: maximumDate.toDate() }
  });

  // Send mail and notification
  users.forEach(user => {
    createNotification({
      name: NOTIFICATION_TYPES.SPONSOR_OR_GODCHILD_CREATE_DONATION,
      date: new Date(),
      donationId: donation.id,
      author: donation.createdBy._id,
      forUser: user.id
    });

    MailFactory.sendSponsorGodchildCreateDonationMail(user, donation);
  });
};
