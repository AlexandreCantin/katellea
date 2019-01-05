import { JWTService } from '../services/jwt.service';
import { UNAUTHORIZED } from 'http-status-codes';
import User from '../models/user';
import { UserService } from '../services/user.service';

export const injectUserFromToken = async (req, res, next) => {

  let methods = ['GET', 'POST', 'PUT', 'DELETE'];

  if(req.originalUrl === '/user') methods = ['PUT', 'DELETE'];
  else if(req.originalUrl.startsWith('/grpd/pdf/')) methods = [];
  else if(req.originalUrl.startsWith('/donation/token/')) methods = [];
  else if(req.originalUrl.startsWith('/user/sponsor/')) methods = [];

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
          req.isAdmin = UserService.isAdmin(user);

          // Admin routes
          if(req.originalUrl.startsWith('/admin') && !req.isAdmin) canContinue = false;
          else canContinue = true;
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
