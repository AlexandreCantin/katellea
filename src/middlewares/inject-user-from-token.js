import { JWTService } from '../services/jwt.service';
import { UNAUTHORIZED } from 'http-status-codes';
import User from '../models/user';
import MailFactory from '../services/mail.service';

export const injectUserFromToken = async (req, res, next) => {

  let methods = ['GET', 'POST', 'PUT', 'DELETE'];
  if(req.baseUrl === '/user') methods = ['PUT', 'DELETE'];
  if(req.originalUrl.startsWith('/donation/token/')) methods = [];

  if (methods.includes(req.method)) {
    let canContinue = false;

    if (req.headers.hasOwnProperty('katellea-token')) {
      const token = req.headers['katellea-token'];
      const payload = JWTService.decodeAndValidate(token);

      // Add id to params
      if (payload.id) {
        const userId = payload.id;
        const user = await User.findById(userId);

        if(userId && !isNaN(+userId)) {
          req.userId = userId;
          req.user = user;
          req.isAdmin = user.isAdmin || false;
          canContinue = true;

          MailFactory.bloodDonationEligibleMail(user);
        }

      }
    }

    if (!canContinue) {
      res.status(UNAUTHORIZED).send();
      return;
    }
  }

  next();
};
