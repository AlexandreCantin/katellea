import User from './user.js';

// Actions available
export const USER_ACTIONS = {
  SET_USER: 'SET_USER',
  DELETE_USER: 'DELETE_USER',
  USER_UPDATE_LAST_NOTIFICATION_READ_DATE: 'USER_UPDATE_LAST_NOTIFICATION_READ_DATE',
};

export const USER_REDUCERS = (state = {}, action) => {
  switch (action.type) {
    case USER_ACTIONS.DELETE_USER:
      return {};

    case USER_ACTIONS.SET_USER:
      return new User({
        id: action.data.id,
        name: action.data.name,
        email: action.data.email,
        emailVerified: action.data.emailVerified,
        gender: action.data.gender,
        currentDonation: action.data.currentDonation ? action.data.currentDonation : undefined,
        lastDonationDate: action.data.lastDonationDate,
        quotaExceeded: action.data.quotaExceeded,
        lastDonationType: action.data.lastDonationType,
        donationPreference: action.data.donationPreference,
        bloodType: action.data.bloodType,
        sponsor: action.data.sponsor,
        establishment: action.data.establishment,
        firstVisit: action.data.firstVisit,
        minimumDate: action.data.minimumDate,
        sponsorToken: action.data.sponsorToken,
        katelleaToken: action.data.katelleaToken ? action.data.katelleaToken : state.katelleaToken, // Keep token if no token given
        plateletActive: action.data.plateletActive,
        godchildNumber: action.data.godchildNumber,
        notificationSettings: action.data.notificationSettings,
        lastNotificationReadDate: action.data.lastNotificationReadDate,
        stats: action.data.stats,
        createdAt: action.data.createdAt,
        updatedAt: action.data.updatedAt
      });

    case USER_ACTIONS.USER_UPDATE_LAST_NOTIFICATION_READ_DATE: {
      let user = state.copy();
      user.lastNotificationReadDate = action.data.lastNotificationReadDate;
      return user;
    }

    default:
      return state;
  }
};
