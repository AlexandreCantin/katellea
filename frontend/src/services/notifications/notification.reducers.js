import { Notification } from './notification';

export const NOTIFICATIONS_ACTIONS = {
  ADD_NEW_NOTIFICATION: 'ADD_NEW_NOTIFICATION',
  ADD_NOTIFICATIONS: 'ADD_NOTIFICATIONS',
  DELETE_NOTIFICATIONS: 'DELETE_NOTIFICATIONS',
};

export const NOTIFICATION_REDUCERS = (state = {}, action) => {
  switch (action.type) {

    /*
    case NOTIFICATIONS_ACTIONS.ADD_NEW_NOTIFICATION:
      // TODO: max 10
      let newState = state.unshift(0);
      return newState;
    */

    case NOTIFICATIONS_ACTIONS.ADD_NOTIFICATIONS: {
      let notifications = [];

      action.data.forEach(notification => {
        notifications.push(new Notification({
          type: notification.name,
          date: notification.date,
          donationId: notification.donationId,
          author: notification.author,
          data: notification.data
        }));
      });
      return notifications;
    }

    case NOTIFICATIONS_ACTIONS.DELETE_NOTIFICATIONS:
      return {};

    default:
      return state;
  }
};
