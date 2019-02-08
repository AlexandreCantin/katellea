import sanitize from 'sanitize-html';

import { POLL_ANSWERS } from '../constants';
import { environment } from '../../conf/environment';
import MailFactory from '../services/mail.service';


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


export const notifyCreatorNetwork = async (donation, user) => {
  const WEEKS_DELAY_BEFORE_ELIGIBILITY = environment.weeksDelayBeforeEligibilty;

  // Compute ids
  let ids = user.network;
  if (ids.length === 0) return;

  // Get oldest date and add 1 week => if user is eligible to the oldest date, he is eligible to the donation
  const oldestPollSuggestion = donation.pollSuggestions.reduce((ps, currentOldDate) => dayjs(ps.date).isAfter(dayjs(currentOldDate)) ? ps.date : currentOldDate);
  const maximumDate = dayjs(oldestPollSuggestion.date).add(WEEKS_DELAY_BEFORE_ELIGIBILITY, 'week');

  // Compute request
  const users = await User.find({
    _id: { $in: ids },
    currentDonationToken: { $exists: false },
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

export const sendDonationAdminMail = (guestData, donation) => {
  const name = sanitize(guestData.name);
  const email = sanitize(guestData.email);

  MailFactory.sendDonationAdminMail(name, email, donation);
}