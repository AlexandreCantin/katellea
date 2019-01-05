import { environment } from '../../conf/environment';
import { IncomingWebhook } from '@slack/client';
import { sendError } from '../helper';

/**
 * Service for communication with Slack
 */
class SlackServiceFactory {

  constructor() {
    if(environment.cronWebhookUrl) this.cronWebhook = new IncomingWebhook(environment.cronWebhookUrl);
    if(environment.contactFormWebhookUrl) this.contactFormWebhook = new IncomingWebhook(environment.contactFormWebhookUrl);
  }

  sendCronMessage(message) {
    if(!environment.cronWebhookUrl) return;

    this.cronWebhook.send(message, function(err, res) {
      if (err) sendError(err);
    });
  }

  sendContactFormMessage(htmlBody) {
    if(!environment.contactFormWebhookUrl) return;

    this.contactFormWebhook.send(htmlBody, function(err, res) {
      if (err) sendError(err);
    });
  }

}

// Export as singleton
const slackServiceFactory = new SlackServiceFactory();
Object.freeze(slackServiceFactory);
export { slackServiceFactory as SlackService };
