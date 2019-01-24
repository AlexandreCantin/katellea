import logger from './services/logger.service';
import { SentryService } from './services/sentry.service';
import { environment } from '../conf/environment';

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
  if(environment.production !== 'production') console.log(err);
}

// Small string format : http://mir.aculo.us/2011/03/09/little-helpers-a-tweet-sized-javascript-templating-engine/
export function simpleTemplate(string, data) {
  let result = string;
  for (const entry in data) {
      if (!entry) continue;
      result = result.replace(new RegExp('{' + entry + '}', 'g'), data[entry]);
  }
  return result;
}

/**
 * When we want to use an async function in a forEach but want to respect the loop order
 * See: https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
 */
export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}