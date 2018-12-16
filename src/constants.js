
export const DONATION_STATUS = {
  POLL_ON_GOING: 'POLL_ON_GOING',
  POLL_ENDED: 'POLL_ENDED',
  DATE_CONFIRMED: 'DATE_CONFIRMED',
  DONE: 'DONE',
  CANCELED: 'CANCELED',
  STATISTICS: 'STATISTICS'
};
export const DONATION_VISIBILITY = { PRIVATE: 'PRIVATE', SMALL_NETWORK: 'SMALL_NETWORK', PUBLIC: 'PUBLIC' };

export const DONATION_EVENTS = {
  CREATE_DONATION: 'CREATE_DONATION',
  ADD_POLL_ANSWER: 'ADD_POLL_ANSWER',
  UPDATE_POLL_ANSWER: 'UPDATE_POLL_ANSWER',
  CLOSE_POLL: 'CLOSE_POLL',
  CREATE_NEW_POLL: 'CREATE_NEW_POLL',
  SCHEDULE_DONATION: 'SCHEDULE_DONATION',
  ADD_COMMENT: 'ADD_COMMENT',
  QUIT: 'QUIT',
  DONE: 'DONE',
};

export const BLOOD_TYPE = { 'UNKNOWN': 'UNKNOWN', 'A+': 'A+', 'A-': 'A-', 'B+': 'B+', 'B-': 'B-', 'AB+': 'AB+', 'AB-': 'AB-', 'O+': 'O+', 'O-': 'O-' };
export const DAY_PARTS = { DAY: 'DAY', MORNING: 'MORNING', AFTERNOON: 'AFTERNOON' };
export const POLL_ANSWERS = { YES: 'YES', NO: 'NO', MAYBE: 'MAYBE' };
export const DONATION_TYPE = { NONE: 'NONE', BLOOD: 'BLOOD', PLASMA: 'PLASMA', PLATELET: 'PLATELET' };
export const GENDER = { MALE: 'MALE', FEMALE: 'FEMALE', UNKNOWN: 'UNKNOWN' };

export const DONATION_TYPE_LABEL = { BLOOD: 'sang', PLASMA: 'plasma', PLATELET: 'plaquettes' };

// TODO: check if only related to the last donation ?
export const DONATION_REST_WEEKS = {
  BLOOD: 8, // 8 weeks
  PLASMA: 2, // 2 weeks
  PLATELET: 4 // 4 weeks
};

export const NOTIFICATION_TYPES = {
  SPONSOR_OR_GODCHILD_CREATE_DONATION: 'SPONSOR_OR_GODCHILD_CREATE_DONATION',
  SOMEONE_ADD_POLL_ANSWER_TO_YOUR_DONATION: 'SOMEONE_ADD_POLL_ANSWER_TO_YOUR_DONATION',
  SOMEONE_UPDATE_POLL_ANSWER_TO_YOUR_DONATION: 'SOMEONE_UPDATE_POLL_ANSWER_TO_YOUR_DONATION',
  SOMEONE_ADD_COMMENT_TO_YOUR_DONATION: 'SOMEONE_ADD_COMMENT_TO_YOUR_DONATION',
  SOMEONE_QUIT_YOUR_DONATION: 'SOMEONE_QUIT_YOUR_DONATION',
  CLOSE_POLL_TO_YOUR_CURRENT_DONATION: 'CLOSE_POLL_TO_YOUR_CURRENT_DONATION',
  FINAL_DATE_TO_YOUR_CURRENT_DONATION: 'FINAL_DATE_TO_YOUR_CURRENT_DONATION',
  DONATION_DONE: 'DONATION_DONE',
  DONATION_STATISTICS: 'DONATION_STATISTICS',
  ELIGIBLE_TO_NEW_DONATION: 'ELIGIBLE_TO_NEW_DONATION',
  FIRST_DONATION_REMINDER: 'FIRST_DONATION_REMINDER',
};

export const GRPD_EXPORT_STATUS = {
  ASKED: 'ASKED',
  DONE: 'DONE',
  CANCELED: 'CANCELED',
};

export const extractEnumValues = enumerate => Object.keys(enumerate).map(k => enumerate[k]);
