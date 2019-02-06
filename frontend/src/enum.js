export const EMPTY = {};

export const DAY_PARTS = {
  DAY: 'DAY',
  MORNING: 'MORNING',
  AFTERNOON: 'AFTERNOON',
};

export const DAY_PARTS_LABEL = {
  DAY: 'Toute la journée',
  MORNING: 'Matin',
  AFTERNOON: 'Après-midi',
};

export const DONATION_TYPE_LABELS = {
  BLOOD: 'Don de sang',
  PLASMA: 'Don de plasma',
  PLATELET: 'Don de plaquettes',
};

export const SHARE_PREFIXES = {
  FACEBOOK: 'fb',
  TWITTER: 'tw',
  DIRECT: 'dir',
  INSTAGRAM: 'ins',
};

export const DONATION_STATUS = {
  POLL_ON_GOING: 'POLL_ON_GOING',
  POLL_ENDED: 'POLL_ENDED',
  DATE_CONFIRMED: 'DATE_CONFIRMED',
  DONE: 'DONE',
  CANCELED: 'CANCELED',
  STATISTICS: 'STATISTICS'
};

export const DONATION_EVENTS = {
  CREATE_DONATION: 'CREATE_DONATION',
  ADD_POLL_ANSWER: 'ADD_POLL_ANSWER',
  UPDATE_POLL_ANSWER: 'UPDATE_POLL_ANSWER',
  CLOSE_POLL: 'CLOSE_POLL',
  RESET_POLL: 'RESET_POLL',
  SCHEDULE_DONATION: 'SCHEDULE_DONATION',
  ADD_COMMENT: 'ADD_COMMENT',
  QUIT: 'QUIT',
  DONE: 'DONE',
};

export const DONATION_IMAGES = {
  BLOOD: { src: '/img/donation-type/blood.svg', alt: 'Don du sang' },
  PLASMA: { src: '/img/donation-type/plasma.svg', alt: 'Don de plasma' },
  PLATELET: { src: '/img/donation-type/platelet.svg', alt: 'Don de plaquettes' }
};

export const DONATION_LOCATION = {
  MOBILE_COLLECT: { src: '/img/donation-location/mobile-collect.svg', alt: 'Collecte mobile' },
  ESTABLISHMENT: { src: '/img/donation-location/fixed-site.svg', alt: "Etablissement de l'EFS" }
};

// TODO: check if only related to the last donation ?
export const DONATION_REST_WEEKS = {
  BLOOD: 8, // 8 weeks
  PLASMA: 2, // 2 weeks
  PLATELET: 4 // 4 weeks
};

export const GENDER = { MALE: 'MALE', FEMALE: 'FEMALE', UNKNOWN: 'UNKNOWN' };
export const POLL_ANSWERS = { YES: 'YES', NO: 'NO', MAYBE: 'MAYBE' };

export const NOTIFICATION_ANSWERS = { YES: 'YES', NO: 'NO' }
