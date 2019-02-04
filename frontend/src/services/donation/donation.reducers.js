import Donation from './donation.js';
import { EMPTY } from '../../enum.js';

// Actions available
export const DONATION_ACTIONS = {
  SET_DONATION: 'SET_DONATION',
  DELETE_DONATION: 'DELETE_DONATION',
};

export const DONATION_REDUCERS = (state = EMPTY, action) => {
  switch (action.type) {

    case DONATION_ACTIONS.DELETE_DONATION:
      return {};

    case DONATION_ACTIONS.SET_DONATION:
      return new Donation({
        id: action.data.id,
        isPublicDonation: action.data.isPublicDonation,
        status: action.data.status,
        establishment: action.data.establishment,
        mobileCollect: action.data.mobileCollect,
        donationType: action.data.donationType,
        pollSuggestions: action.data.pollSuggestions,
        pollAnswers: action.data.pollAnswers,
        finalDate: action.data.finalDate,
        events: action.data.events,
        finalAttendeesUser: action.data.finalAttendeesUser,
        finalAttendeesGuest: action.data.finalAttendeesGuest,
        statisticsDate: action.data.statisticsDate,
        donationToken: action.data.donationToken,
        createdBy: action.data.createdBy,
        createdByGuest: action.data.createdByGuest,
        createdAt: action.data.createdAt,
        updatedAt: action.data.updatedAt
      });

    default:
      return state;
  }
};