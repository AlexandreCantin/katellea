import { isArray } from 'util';
import { environment } from '../../conf/environment';
import logger from './logger.service';

/**
 * Service for sending email with Sendgrid
 */
class SendgridServiceFactory {

  constructor() {
    const mailConfig = environment.mail;

    this.fromEmail = mailConfig.fromEmail;
    this.fromName = mailConfig.fromName;

    this.redirectAllMailTo = mailConfig.redirectAllMailTo;
    this.activateMail = mailConfig.activateMail;


    this.sgMail = require('@sendgrid/mail');
    this.sgMail.setApiKey(environment.mail.apiKey);
  }

  sendMail({ subject, htmlContent, to }) {
    if (!this.activateMail) {
      logger.error(`Mail was not send because 'activateMail' is false`);
      return;
    }

    // Handle if we got is only a e-mail
    if (!isArray(to)) to = [to];

    // Dev-only => Redirect all mail to one e-mail address
    if (this.redirectAllMailTo) to = [this.redirectAllMailTo];

    logger.info(`Sending email => ${subject} -- To : ${to.join(', ')}`);

    to.forEach(email => {
      try {
        const msg = {
          to: email,
          from: this.fromEmail,
          subject,
          html: htmlContent
        };
        this.sgMail.send(msg);
      } catch (err) {
        logger.error(err);
        throw err;
      }
    });
  }

}

// Export as singleton
const sendgridServiceFactory = new SendgridServiceFactory();
Object.freeze(sendgridServiceFactory);
export { sendgridServiceFactory as SendgridService };
