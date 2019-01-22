import ejs from 'ejs';
import dayjs from 'dayjs';

import { SendgridService } from './sendgrid.service';
import { DONATION_TYPE_LABEL } from '../constants';
import User from '../models/user';
import { environment } from '../../conf/environment';

const DISCLAIMER = `
  N'hésitez pas à prendre des photos/selfies de votre don et à les partager sur les réseaux sociaux.<br/>
  Il n'y a pas de honte à partager votre geste. Au contraire, cela peut inspirer d'autres personnes à en faire aussi !
`;

const FOOTER = `À bientôt sur <a href="${environment.frontUrl}">Katellea</a>`;
const FOOTER_TEAM = `À bientôt,<br/>L'équipe de <a href="${environment.frontUrl}">Katellea</a>`;

const computeDonationDate = date => dayjs(date).format('dddd DD/MM/YYYY à HH:mm');
const computeDate = date => dayjs(date).format('dddd DD/MM');

/**
 * Service for creating generating content and call SendgridService for sending
 */
export default class MailFactory {

  static sendAttendeeMail(donation) {
    const authorName = donation.createdBy.name;
    const subject = `Invitation à un don du sang par ${authorName}`;

    donation.finalAttendees.map(async attendee => {
      if(attendee._id === donation.createdBy._id) return;
      const user = await User.findById(attendee._id);

      const htmlContent = await ejs.renderFile('./src/templates/emails/send-attendee-mail.ejs', {
        user,
        authorName,
        donationDate: computeDonationDate(donation.finalDate),
        donationType: DONATION_TYPE_LABEL[donation.donationType],
        DISCLAIMER,
        FOOTER
      });

      try {
        SendgridService.sendMail({ subject, htmlContent, to: user.email });
      } catch(err) {/* Nothing to do */}
    });
  }


  static async bloodDonationEligibleMail(user) {
    if(MailFactory.userDeclineNotification(user, 'bloodEligible')) return;

    const subject = `Votre délai d'attente entre deux dons est bientôt terminé`;

    const htmlContent = await ejs.renderFile('./src/templates/emails/blood-donation-eligible-mail.ejs', {
      user,
      frontUrl: environment.frontUrl,
      lastDonationDate: computeDate(user.lastDonationDate),
      FOOTER_TEAM
    });

    try {
      SendgridService.sendMail({ subject, htmlContent, to: user.email });
    } catch(err) {/* Nothing to do */}
  }


  static async firstDonationReminder(user) {
    const subject = `Vous ferez bientôt votre premier don`;

    const htmlContent = await ejs.renderFile('./src/templates/emails/first-donation-reminder.ejs', {
      user,
      FOOTER_TEAM
    });

    try {
      SendgridService.sendMail({ subject, htmlContent, to: user.email });
    } catch(err) {/* Nothing to do */}
  }


  static async sendSponsorGodchildCreateDonationMail(user, donation) {
    if(MailFactory.userDeclineNotification(user, 'sponsorGodchildCreateDonation')) return;

    let userHasAlreadyOneDonation = false;
    if(user.hasOwnProperty('lastDonationDate')) {
      userHasAlreadyOneDonation = (user.lastDonationDate !== undefined && user.lastDonationDate !== null);
    }

    const htmlContent = await ejs.renderFile('./src/templates/emails/send-sponsor-godchild-create-donation-mail.ejs', {
      user,
      frontUrl: environment.frontUrl,
      userHasAlreadyOneDonation,
      FOOTER_TEAM
    });

    const subject = `${donation.createdBy.name} vient de proposer un nouveau don`;

    try {
      SendgridService.sendMail({ subject, htmlContent, to: user.email });
    } catch(err) {/* Nothing to do */}
  }


  static async sendGRPDMail(user, url) {
    const subject = `Export de vos données personnelles`;

    const htmlContent = await ejs.renderFile('./src/templates/emails/grpd-export-mail.ejs', {
      user,
      url,
      FOOTER_TEAM
    });

    try {
      SendgridService.sendMail({ subject, htmlContent, to: user.email });
    } catch(err) {/* Nothing to do */}
  }


  static async sendEmailVerificationEmail(user, url) {
    const subject = `Validation de votre adresse e-mail`;
    const htmlContent = await ejs.renderFile('./src/templates/emails/email-verified-mail.ejs', { url, FOOTER_TEAM });
    try {
      SendgridService.sendMail({ subject, htmlContent, to: user.email });
    } catch(err) {/* Nothing to do */}
  }
  static async reSendEmailVerificationEmail(user, url) {
    const subject = `Validation de votre adresse e-mail`;
    const htmlContent = await ejs.renderFile('./src/templates/emails/resend-email-verified-mail.ejs', { user, url, FOOTER_TEAM });
    try {
      SendgridService.sendMail({ subject, htmlContent, to: user.email });
    } catch(err) {/* Nothing to do */}
  }


  // HELPER
  static userDeclineNotification(user, field) {
    const notificationSettings = user.notificationSettings || {};
    if(!notificationSettings.hasOwnProperty(field)) return false;

    // if TRUE: User ==> wants <== the notification
    return !notificationSettings[field];
  }
}
