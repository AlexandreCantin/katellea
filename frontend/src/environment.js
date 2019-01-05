import overridesEnvironmentValues from './environment-local.js';

export const environmentValues = {
  applicationName: 'Katellea',

  // GLOBAL
  production: false,
  offlineMode: true,

  // GOOGLE ANALYTICS
  GA_ID: '',

  // HOTJAR
  HOTJAR_CODE: '',
  // SENTRY
  SENTRY_CODE: '',

  // LOGIN ROUTES
  FACEBOOK_LOGIN_URL: '/auth/facebook',

  // KATELLEA
  SERVER_URL: 'http://localhost:3000',
  FRONT_URL: 'http://localhost:8080',

  LAST_STATISTICS_URL: '/statistics/last',

  USER_ENDPOINT: '/user',
  USER_SPONSOR_ENDPOINT: '/user/sponsor/',
  USER_IS_ADMIN_ENDPOINT: '/user/is-admin',
  USER_ENDPOINT_WITH_TOKEN: '/remember-me/',
  USER_ENDPOINT_FACEBOOK_TOKEN: '/facebook-connect/',
  USER_ENDPOINT_LOGOUT: '/logout',
  USER_UPDATE_LAST_NOTIFICATION_READ_DATE: '/user/update-notification-read-date',
  USER_ENDPOINT_GRPD_EXPORT: '/grpd/',

  NOTIFICATIONS_ENDPOINT: '/notifications',

  DONATION_ENDPOINT: '/donation',
  DONATION_HISTORY: '/donation/history',
  DONATION_ELIGIBLE_URL: '/donation/eligible-donations',
  DONATION_TOKEN_ENDPOINT: '/donation/token/',
  CAN_ACCESS_DONATION_TOKEN_ENDPOINT: '/donation/can-access/token/',
  DONATION_REMOVE_USER_ENDPOINT: '/remove-user',
  POLL_ANSWER_ENDPOINT: '/poll-answer',
  COMMENT_ENDPOINT: '/comment',

  ESTABLISHMENT_ENDPOINT: '/establishment',
  ESTABLISHMENT_ENDPOINT_CLOSEST: '/establishment/closest',

  MOBILE_COLLECT_ENDPOINT_CLOSEST: '/mobile-collect/closest',

  CONTACT_ENDPOINT_URL: '/contact-form',

  // ADMIN
  ADMIN_LAST_STATISTICS_ENDPOINT: '/admin/statistics/last',
  ADMIN_USER_ENDPOINT: '/admin/users',
  ADMIN_USER_TOTAL_ENDPOINT: '/admin/users/count'
};

class EnvironmentValuesLoader {
  static init() {
    return Object.assign({}, environmentValues, overridesEnvironmentValues);
  }
}


// Export as singleton
const environmentValuesLoader = EnvironmentValuesLoader.init();
Object.freeze(environmentValuesLoader);
export { environmentValuesLoader as environment };