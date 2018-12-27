import UserTempProfile from './user-temp-profile.js';

// Actions available
export const USER_TEMP_ACTIONS = {
  SET_PROFILE: 'SET_PROFILE',
  DELETE_PROFILE: 'DELETE_PROFILE',
};

export const USER_TEMP_REDUCERS = (state = {}, action) => {
  switch (action.type) {
    case USER_TEMP_ACTIONS.SET_PROFILE:
      return new UserTempProfile({
        userID: action.data.userID,
        origin: action.data.origin,
        accessToken: action.data.accessToken,
        name: action.data.name,
        email: action.data.email,
        gender: action.data.gender
      });


    case USER_TEMP_ACTIONS.DELETE_PROFILE:
      return {};

    default:
      return state;
  }
};
