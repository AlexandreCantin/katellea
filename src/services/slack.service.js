import { environment } from '../../conf/environment';
import { IncomingWebhook } from '@slack/client';
import * as Sentry from '@sentry/node';

/**
 * Service for communication with Slack
 */
class SlackServiceFactory {

  constructor() {
    const url = environment.cronWebhookUrl;
    this.webhook = new IncomingWebhook(url);
  }

  sendMessage(message) {
    this.webhook.send(message, function(err, res) {
      if (err) Sentry.captureException(err);
    });
  }
}

// Export as singleton
const slackServiceFactory = new SlackServiceFactory();
Object.freeze(slackServiceFactory);
export { slackServiceFactory as SlackService };
