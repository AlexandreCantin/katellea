import * as Sentry from '@sentry/node';
import logger from './services/logger.service';

// Check if object contains all the given properties
export const hasOwnProperties = (obj, properties) => {
  for(let i=0; i < properties.length; i++) {
    if(!obj.hasOwnProperty(properties[i])) return false;
  }
  return true;
};

export const sendError = (err) => {
  const message = err.message || err.errmsg;
  Sentry.captureException(message);
  logger.error(message);
}