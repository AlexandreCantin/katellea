import ejs from 'ejs';
import dayjs from 'dayjs';

import { SendgridService } from './sendgrid.service';
import { DONATION_TYPE_LABEL, NOTIFICATION_TYPES } from '../constants';
import User from '../models/user';
import { environment } from '../../conf/environment';
import { simpleTemplate, sendError } from '../helper';

// Global values
const DISCLAIMER = `
  N'hésitez pas à prendre des photos/selfies de votre don et à les partager sur les réseaux sociaux.<br/>
  Il n'y a pas de honte à partager votre geste. Au contraire, cela peut inspirer d'autres personnes à en faire aussi !
`;

const FOOTER = `À bientôt sur <a href="${environment.frontUrl}">Katellea</a>`;
const FOOTER_TEAM = `À bientôt,<br/>L'équipe de <a href="${environment.frontUrl}">Katellea</a>`;

const computeDonationDate = date => dayjs(date).format('dddd DD/MM/YYYY à HH:mm');
const computeDate = date => dayjs(date).format('dddd DD/MM');


const DAYS_REMINDER_DATA = {
  '15': { subject: "Eligible à un nouveau don depuis 15 jours", template: 'day-reminder/15-mail.ejs' },
  '30': { subject: "Eligible à un nouveau don depuis 30 jours", template: 'day-reminder/30-mail.ejs' },
  '90': { subject: "Eligible à un nouveau don depuis 90 jours", template: 'day-reminder/90-mail.ejs' },
}


const SEND_GUEST_CREATOR_MAIL = {
  'SOMEONE_ADD_POLL_ANSWER_TO_YOUR_DONATION': {
    subject: '{name} a répondu à votre proposition de don',
    template: 'someone-add-poll-answer.ejs'
  },
  'SOMEONE_UPDATE_POLL_ANSWER_TO_YOUR_DONATION': {
    subject: '{name} a mis à jour sa proposition de don',
    template: 'someone-update-poll-answer.ejs'
  },
  'SOMEONE_ADD_COMMENT_TO_YOUR_DONATION': {
    subject: '{name} a commenté à votre proposition de don',
    template: 'someone-add-comment.ejs'
  },
  'ELIGIBLE_TO_NEW_DONATION': {
    subject: 'Disponible pour un nouveau don',
    template: 'eligible-to-new-donation.ejs'
  }
}

/**
 * Service for creating generating content and call SendgridService for sending
 */
export default class MailFactory {

  static sendAttendeeMail(donation) {
    const authorName = donation.getCreatorName();
    const subject = `Invitation à un don du sang par ${authorName}`;

    donation.finalAttendeesUser.map(async attendee => {
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
    MailFactory._bloodDonationEligibleMail(user.name, user.email, user.lastDonationDate);
  }

  static async bloodDonationEligibleGuestAdmin(name, email, donation) {
    MailFactory._bloodDonationEligibleMail(name, email, donation.finalDate);
  }

  static async _bloodDonationEligibleMail(name, email, donationDate) {
    const subject = `Votre délai d'attente entre deux dons est bientôt terminé`;
    const htmlContent = await ejs.renderFile('./src/templates/emails/blood-donation-eligible-mail.ejs', {
      name,
      frontUrl: environment.frontUrl,
      donationDate: computeDate(donationDate),
      FOOTER_TEAM
    }).catch((err) => sendError(err));

    try {
      SendgridService.sendMail({ subject, htmlContent, to: email });
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


  static async availableToNewDonationReminder(user, dayNbToSubtract) {
    if(MailFactory.userDeclineNotification(user, dayNbToSubtract + 'DayReminder')) return;

    const data = DAYS_REMINDER_DATA[dayNbToSubtract.toString()];

    const subject = data.subject;
    const htmlContent = await ejs.renderFile('./src/templates/emails/' + data.template, { user, frontUrl: environment.frontUrl, FOOTER_TEAM });

    try {
      SendgridService.sendMail({ subject, htmlContent, to: user.email });
    } catch(err) {/* Nothing to do */}
  }


  static async newAnd30DaysWithoutDonationMail(user) {
    const subject = "Participez ou créer votre premier don";
    const htmlContent = await ejs.renderFile('./src/templates/emails/day-reminder/new-and-30-days-without-donation-mail.ejs', { user, frontUrl: environment.frontUrl, FOOTER_TEAM });

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

  static async sendDonationAdminMail(name, email, donation) {
    const subject = "Votre don créé sur Katellea";
    const donationUrl = `${environment.frontUrl}/donation/${donation.donationToken}`;
    const adminDonationUrl = `${environment.frontUrl}/donation/${donation.donationToken}?admin=${donation.adminToken}`;

    const htmlContent = await ejs.renderFile('./src/templates/emails/guest-creator/donation-admin-mail.ejs',
      { name, donationUrl, adminDonationUrl, FOOTER_TEAM }
    );

    try {
      SendgridService.sendMail({ subject, htmlContent, to: email });
    } catch(err) {/* Nothing to do */}
  }

  static async sendDonationDone(name, email, donation) {
    const subject = "Merci pour votre don !";
    const adminDonationUrl = `${environment.frontUrl}/donation/${donation.donationToken}?admin=${donation.adminToken}`;

    const htmlContent = await ejs.renderFile('./src/templates/emails/guest-creator/donation-done.ejs',
      { name, adminDonationUrl, FOOTER_TEAM }
    );

    try {
      SendgridService.sendMail({ subject, htmlContent, to: email });
    } catch(err) {/* Nothing to do */}
  }

  static async sendGuestCreatorMail(donation, donationType, name, email, actionAuthorName) {
    const donationUrl = `${environment.frontUrl}/donation/${donation.donationToken}`;
    const adminDonationUrl = `${environment.frontUrl}/donation/${donation.donationToken}?admin=${donation.adminToken}`;

    const mailData = SEND_GUEST_CREATOR_MAIL[donationType];
    const htmlContent = await ejs.renderFile('./src/templates/emails/guest-creator/' + mailData.template,
      { name, donationUrl, adminDonationUrl, actionAuthorName, FOOTER_TEAM }
    );

    const subject = simpleTemplate(mailData.subject, { name: actionAuthorName })

    try {
      SendgridService.sendMail({ subject, htmlContent, to: email });
    } catch(err) {/* Nothing to do */}
  }

}
