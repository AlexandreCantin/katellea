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
    const userId = user.id || user._id;

    // Set user verified_email as false
    if(user.emailVerified === true) {
      const userToUpdate = await User.findById(userId);
      userToUpdate.emailVerified = false;
      await userToUpdate.save();
    }

    // Delete old verification if exists
    await EmailVerification.findOneAndRemove({ user: userId });

    // Create new EmailVerification
    const token = generateRandomString(15);
    let emailVerification = new EmailVerification();
    emailVerification.token = token;
    emailVerification.user = userId;
    await emailVerification.save();

    // Send email with email verification link
    const url = `${environment.frontUrl}/email-verification?token=${token}`;

    if(isResend) await MailFactory.reSendEmailVerificationEmail(user, url);
    else await MailFactory.sendEmailVerificationEmail(user, url);
  }


  async verifyUser(emailVerificationToken) {
    const emailVerification = await EmailVerification.findOne({ token: emailVerificationToken });

    // Set user as verified
    const user = await User.findById(emailVerification.user);

    // User already verified ? No need to go further
    if(user.emailVerified === true) return emailVerification.user;

    user.emailVerified = true;
    await user.save();

    // Important => return userId
    return emailVerification.user;
  }

}

// Export as singleton
const emailVerificationServiceFactory = new EmailVerificationServiceFactory();
Object.freeze(emailVerificationServiceFactory);
export { emailVerificationServiceFactory as EmailVerificationService };
