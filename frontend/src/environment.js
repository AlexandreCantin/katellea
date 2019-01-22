import overridesEnvironmentValues from './environment-local.js';

export const environmentValues = {
  applicationName: 'Katellea',

  // GLOBAL
  production: false,
  offlineMode: true,

  FACEBOOK_APP_ID: '',

  // GOOGLE ANALYTICS
  GA_ID: '',

  // HOTJAR
  HOTJAR_CODE: '',
  // SENTRY
  SENTRY_CODE: '',

  // LOGIN ROUTES
  FACEBOOK_LOGIN_URL: '/auth/facebook',
  GOOGLE_LOGIN_URL: '/auth/google/',
  TWITTER_LOGIN_URL: '/auth/twitter/',
  INSTAGRAM_LOGIN_URL: '/auth/instagram/',

  // KATELLEA
  SERVER_URL: 'http://localhost:3000',
  FRONT_URL: 'http://localhost:8080',

  LAST_STATISTICS_URL: '/statistics/last',

  USER_ENDPOINT: '/user',
  USER_SPONSOR_ENDPOINT: '/user/sponsor/',
  USER_SEND_VALIDATE_MAIL_ENDPOINT: '/user/email-verification/',
  USER_RESEND_MAIL_ENDPOINT: '/user/re-send-email-verification',
  USER_SPONSOR_COMPATIBILITY_ENDPOINT: '/user/sponsor-compatibility',
  USER_IS_ADMIN_ENDPOINT: '/user/is-admin',
  USER_GODCHILDS_ENDPOINT: '/user/godchilds',
  USER_ENDPOINT_WITH_TOKEN: '/remember-me/',
  USER_ENDPOINT_FACEBOOK_TOKEN: '/facebook-connect/',
  USER_ENDPOINT_TWITTER_TOKEN: '/twitter-connect/',
  USER_ENDPOINT_GOOGLE_TOKEN: '/google-connect/',
  USER_ENDPOINT_INSTAGRAM_TOKEN: '/instagram-connect/',
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
  ADMIN_SEARCH_USER_ENDPOINT: '/admin/users/search',
  ADMIN_USER_TOTAL_ENDPOINT: '/admin/users/count',

  ADMIN_CITY_ENDPOINT: '/admin/city-establishment/city',
  ADMIN_SEARCH_CITY_ENDPOINT: '/admin/city-establishment/city/search',
  ADMIN_CITY_TOTAL_ENDPOINT: '/admin/city-establishment/city/count',

  ADMIN_ESTABLISHMENT_ENDPOINT: '/admin/city-establishment/establishment',
  ADMIN_SEARCH_ESTABLISHMENT_ENDPOINT: '/admin/city-establishment/establishment/search',

  ADMIN_LOGS_ENDPOINT: '/admin/logs',
  ADMIN_LOGS_TOTAL_ENDPOINT: '/admin/logs/count',
  ADMIN_USER_LOGS_ENDPOINT: '/admin/logs/user/',
  ADMIN_LAST_USER_LOG_ENDPOINT: '/admin/logs/user/last',
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