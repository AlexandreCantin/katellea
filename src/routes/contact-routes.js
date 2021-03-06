

import express from 'express';
import { BAD_REQUEST } from 'http-status-codes';
import { hasOwnProperties, sendError } from '../helper';
import { SendgridService } from '../services/sendgrid.service';
import sanitize from 'sanitize-html';
import { environment } from '../../conf/environment';
import { SlackService } from '../services/slack.service';

const contactRoutes = express.Router();

const MESSAGE_SUBJECT = 'Nouveau message reçu via le formulaire de contact';


const sendContactForm = async (req, res) => {
  // Check values
  if (!hasOwnProperties(req.body, ['fullName', 'email', 'subject', 'message'])) return res.status(BAD_REQUEST).send();

  // Handle extra text (for security reason)
  const fullName = req.body.fullName.substring(0, 150);
  const email = req.body.email.substring(0, 150);
  const subject = req.body.subject.substring(0, 150);
  const message = req.body.message.substring(0, 3000);


  const htmlContent = `
    Date: ${new Date()}<hr/>
    Nom & prénom : ${sanitize(fullName)}<br/>
    E-mail : ${sanitize(email)}<br/>
    Subject : ${subject}<br/>
    Message :<br/><pre>${sanitize(message)}</pre><br/>
  `;

  SlackService.sendContactFormMessage(htmlContent);

  try {
    await SendgridService.sendMail({
      subject: MESSAGE_SUBJECT,
      htmlContent,
      to: environment.mail.contactEmail,
    });
  } catch (err) {
    sendError(err);
    return res.status(501).send();
  }
  return res.status(200).send();
};

// Routes
contactRoutes.post('/contact-form', sendContactForm);
export default contactRoutes;
