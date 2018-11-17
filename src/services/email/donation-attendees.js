import { MailjetService } from '../mailjet.service';
import User from '../../models/user';
import { DONATION_TYPE_LABEL } from '../../constants';
import dayjs from 'dayjs';
import { environment } from '../../../conf/environment';

const DISCLAIMER = `
  N'hésitez pas à prendre des photos/selfies de votre don et à les partager sur les réseaux sociaux.<br/>
  Il n'y a pas de honte à partager votre geste. Au contraire, cela peut inspirer d'autres personnes à en faire aussi !
`;

const FOOTER = `À bientôt sur <a href=${environment.frontUrl}>Katellea</a>`;
const FOOTER_TEAM = `À bientôt,<br/>L'équipe sur <a href=${environment.frontUrl}>Katellea</a>`;

const computeDonationDate = date => dayjs(date).format('dddd DD/MM/YYYY à HH:mm');
const computeDate = date => dayjs(date).format('dddd DD/MM');

/**
 * Service for creating generating content and call MailJetService for sending
 */
export default class MailFactory {

  static sendAttendeeMail(donation) {
    const authorName = `${donation.createdBy.firstName} ${donation.createdBy.lastName}`;
    const subject = `Invitation à un don du sang par ${authorName}`;

    const firstSentence = `${authorName} a indiqué et compte sur votre présence à un don de ${DONATION_TYPE_LABEL[donation.donationType]} le ${computeDonationDate(donation.finalDate)}.`;

    donation.finalAttendees.map(async attendee => {
      if(attendee._id === donation.createdBy._id) return;

      const user = await User.findById(attendee._id);
      const htmlContent = `${user.firstName},<br/><br/>${firstSentence}<br/><br/>${DISCLAIMER}<br/><br/>${FOOTER}`;

      try {
        MailjetService.sendMail({ subject, htmlContent, to: user.email });
      } catch(err) {/* Nothing to do */}
    });
  }

  static bloodDonationEligibleMail(user) {
    const subject = `Votre délai d'attente entre deux dons est bientôt terminé`;

    const firstSentence = `Pour commencer, l'équipe de Katellea et l'Etablissement Français du Sang souhaite vous remercier pour votre don réalisé le ${computeDate(user.lastDonationDate)}`;
    const secondSentence = `Toutefois, une poche de sang ayant une durée de vie de seulement de 42 jours, les besoins en sang sont constants et c'est pour cela que nous vous sollicitons !`;
    const thirdSentence = `En effet, dans environ 3 semaines, votre délai d'attente sera terminé et nous vous invitons dès à présent à planifier votre prochain rendez-vous sur <a href=${environment.frontUrl}>Katellea</a>`;
    const htmlContent = `${user.firstName},<br/><br/>${firstSentence}<br/><br/>${secondSentence}<br/><br/>${thirdSentence}<br/><br/>${FOOTER_TEAM}`;
    try {
      MailjetService.sendMail({ subject, htmlContent, to: user.email });
    } catch(err) {/* Nothing to do */}
  }

  static firstDonationReminder(user) {
    const subject = `Vous ferez bientôt votre premier don`;

    const faqLink = `<a href='https://dondesang.efs.sante.fr/faq'>FAQ du don du sang</a>`;
    const firstDonationLink = `<a href='https://dondesang.efs.sante.fr/donner-je-donne-pour-la-premiere-fois/premier-don-ce-quil-faut-savoir'>Premier don, ce qu'il faut savoir</a>`;

    const firstSentence = `Dans deux jours, vous allez effectuer votre premier don du sang et pour cela nous vous remercions par avance !`;
    const secondSentence = `Afin que tout se passe sans encombre, nous vous rappelons d'emmener votre carte d'identité.`;
    const thirdSentence = `Pour en savoir plus, nous invitons à consulter ces liens : ${faqLink} - ${firstDonationLink}`;
    const fourSentence = `<em style="font-size:.9em">Si cela n'est pas votre premier don, nous vous prions d'ignorer ce message.</em>`;
    const htmlContent = `${user.firstName},<br/><br/>${firstSentence}<br/><br/>${secondSentence}<br/><br/>${thirdSentence}<br/><br/>${fourSentence}<br/><br/>${FOOTER_TEAM}`;
    try {
      MailjetService.sendMail({ subject, htmlContent, to: user.email });
    } catch(err) {/* Nothing to do */}
  }

  static sendSponsorGodchildCreateDonationMail(user, donation) {
    const creatorName = `${donation.createdBy.firstName} ${donation.createdBy.lastName}`;

    let userHasAlreadyOneDonation = false;
    if(user.hasOwnProperty('lastDonationDate')) {
      userHasAlreadyOneDonation = (user.lastDonationDate !== undefined && user.lastDonationDate !== null);
    }

    const subject = `${creatorName} vient de proposer un nouveau don`;

    let firstSentence = `${creatorName} vient de créer une nouvelle proposition de don.`;
    if(userHasAlreadyOneDonation) firstSentence = firstSentence.concat(` Cette dernière comporte des dates respectant votre délai d'attente suite à votre précédent don.`);
    const secondSentence = `Nous vous invitons donc à consulter cette proposition sur <a href="${environment.frontUrl}/tableau-de-bord">votre tableau de bord</a>`;
    const htmlContent = `${user.firstName},<br/><br/>${firstSentence}<br/><br/>${secondSentence}<br/><br/>${FOOTER}`;

    try {
      MailjetService.sendMail({ subject, htmlContent, to: user.email });
    } catch(err) {/* Nothing to do */}
  }

}
