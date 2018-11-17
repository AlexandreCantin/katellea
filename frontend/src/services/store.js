import { combineReducers, createStore } from 'redux';

import { USER_REDUCERS } from './user/user.reducers';
import { DONATION_REDUCERS } from './donation/donation.reducers';
import { FLASH_MESSAGE_REDUCERS } from './flash-message/flash-message.reducers';
import { NOTIFICATION_REDUCERS } from './notifications/notification.reducers';
import { USER_TEMP_REDUCERS } from './user-temp/user-temp.reducers';

let store = createStore(
  combineReducers({
    user: USER_REDUCERS,
    donation: DONATION_REDUCERS,
    flashMessage: FLASH_MESSAGE_REDUCERS,
    userTempProfile: USER_TEMP_REDUCERS,
    notifications: NOTIFICATION_REDUCERS,
  })
);

export default store;
