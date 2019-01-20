import dayjs from 'dayjs';

import { environment } from '../../conf/environment';
import { generateRandomString } from '../helpers/string.helper';

import MailFactory from './mail.service';
import EmailVerification from '../models/email-verification';
import User from '../models/user';

class EmailVerificationServiceFactory {

  /** Check if user already have an emailVerified on going created in the last hour => avoid too much spam ! */
  async checkEmailVerificationOnGoing(user) {
    const emailVerificationOnGoingNumber = await EmailVerification.countDocuments({
      user: user.id,
      createdAt: { $gte: dayjs().subtract(1, 'hour').toDate() }
    });
    return emailVerificationOnGoingNumber > 0;
  }

  async createEmailVerification(user, isResend = false) {
    // Set user verified_email as false
    if(user.emailVerified === true) {
      user.emailVerified = false;
      user.save();
    }

    // Delete old verification if exists
    await EmailVerification.findOneAndRemove({ user: user.id });

    // Create new EmailVerification
    const token = generateRandomString(15);
    let emailVerification = new EmailVerification();
    emailVerification.token = token;
    emailVerification.user = user.id;
    emailVerification.save()

    // Send email with email verification link
    const url = `${environment.frontUrl}/email-verification?token=${token}`;

    if(isResend) MailFactory.reSendEmailVerificationEmail(user, url)
    else MailFactory.sendEmailVerificationEmail(user, url);
  }


  async verifyUser(emailVerificationToken) {
    try {
      const emailVerification = await EmailVerification.findOne({ token: emailVerificationToken });

      // Set user as verified
      const user = await User.findById(emailVerification.user);

      // User already verified ? No need to go further
      if(user.emailVerified === true) return emailVerification.user;

      user.emailVerified = true;
      await user.save();

      // Important => return userId
      return emailVerification.user;
    } catch(err) {
      throw new Error('User not set as verified');
    }
  }

}

// Export as singleton
const emailVerificationServiceFactory = new EmailVerificationServiceFactory();
Object.freeze(emailVerificationServiceFactory);
export { emailVerificationServiceFactory as EmailVerificationService };
