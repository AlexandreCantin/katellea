import Donation from './donation.js';

// Actions available
export const DONATION_ACTIONS = {
  SET_DONATION: 'SET_DONATION',
  DELETE_DONATION: 'DELETE_DONATION',
};

export const DONATION_REDUCERS = (state = {}, action) => {
  switch (action.type) {

    case DONATION_ACTIONS.DELETE_DONATION:
      return {};

    case DONATION_ACTIONS.SET_DONATION:
      return new Donation({
        id: action.data.id,
        status: action.data.status,
        visibility: action.data.visibility,
        establishment: action.data.establishment,
        mobileCollect: action.data.mobileCollect,
        donationType: action.data.donationType,
        pollSuggestions: action.data.pollSuggestions,
        pollAnswers: action.data.pollAnswers,
        finalDate: action.data.finalDate,
        events: action.data.events,
        finalAttendees: action.data.finalAttendees,
        statisticsDate: action.data.statisticsDate,
        donationToken: action.data.donationToken,
        createdBy: action.data.createdBy,
        createdAt: action.data.createdAt,
        updatedAt: action.data.updatedAt
      });

    default:
      return state;
  }
};