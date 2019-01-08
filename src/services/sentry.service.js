import { environment } from '../../conf/environment';
import * as Sentry from '@sentry/node';

/**
 * Service for communication with Sentry
 */
Sentry.init({ dsn : environment.sentry.dsn });

class SentryServiceFactory {
  sendError(err) {
    Sentry.captureException(err);
  }
}

// Export as singleton
const sentryService = new SentryServiceFactory();
Object.freeze(sentryService);
export { sentryService as SentryService };
