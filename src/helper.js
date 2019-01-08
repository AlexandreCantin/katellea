import logger from './services/logger.service';
import { SentryService } from './services/sentry.service';

// Check if object contains all the given properties
export const hasOwnProperties = (obj, properties) => {
  for(let i=0; i < properties.length; i++) {
    if(!obj.hasOwnProperty(properties[i])) return false;
  }
  return true;
};

export const sendError = (err) => {
  const message = err.message || err.errmsg;
  SentryService.sendError(err);
  logger.error(message);
}