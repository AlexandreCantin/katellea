import mailjet from 'node-mailjet';
import { isArray } from 'util';
import { environment } from '../../conf/environment';

/**
 * Service for sending email with MailJet
 */
class MailjetServiceFactory {

  constructor() {
    const mailConfig = environment.mail;

    this.fromEmail = mailConfig.fromEmail;
    this.fromName = mailConfig.fromName;

    this.redirectAllMailTo = mailConfig.redirectAllMailTo;
    this.activateMail = mailConfig.activateMail;

    this.mailjetInstance = mailjet.connect(mailConfig.apiKeyPublic, mailConfig.apiKeyPrivate);
  }

  sendMail({ subject, htmlContent, to }) {
    if (!this.activateMail) {
      console.error(`Mail was not send because 'activateMail' is false`);
      return;
    }

    // Handle if we got is only a e-mail
    if (!isArray(to)) to = [{ 'Email': to }];
    else to = to.map(mail => [{ 'Email': mail }]);

    if (this.redirectAllMailTo) to = [{ 'Email': this.redirectAllMailTo }];

    console.error(`Sending email => ${subject} -- To : ${to.map(email => email.Email).join(', ')}`);
    try {
      this.mailjetInstance
        .post('send')
        .request({
          'FromEmail': this.fromEmail,
          'FromName': this.fromName,
          'Subject': subject,
          'Htmlpart': htmlContent,
          'Recipients': to
        });
    } catch (err) {
      console.error(`Error while sending email => ${err.statusCode} -- Error : ${err.ErrorMessage} -- Message : ${err.response.res.statusMessage}`);
      throw err;
    }
  }

}

// Export as singleton
const mailjetServiceFactory = new MailjetServiceFactory();
Object.freeze(mailjetServiceFactory);
export { mailjetServiceFactory as MailjetService };
