import { JWTService } from '../services/jwt.service';
import { UNAUTHORIZED } from 'http-status-codes';
import User from '../models/user';
import { UserService } from '../services/user.service';
import { AdminLogService } from '../services/admin-log.service';

export const injectUserFromToken = async (req, res, next) => {

  // 1- Inject user if token
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

        // Register AdminLog
        if(req.originalUrl.startsWith('/admin') && req.isAdmin) AdminLogService.createLog(user);
      }
    }
  }


  // 2- Check if user can access
  let methods = ['GET', 'POST', 'PUT', 'DELETE'];

  if(req.originalUrl === '/user') methods = ['PUT', 'DELETE'];
  else if(req.originalUrl.startsWith('/grpd/pdf/')) methods = [];

  else if(req.originalUrl.startsWith('/donation')) {
    methods = ['DELETE'];
    if(req.originalUrl !== '/donation/eligible-donations' || req.originalUrl !== '/donation/history') methods = [];
  }

  else if(req.originalUrl.startsWith('/user/sponsor/')) methods = [];
  else if(req.originalUrl.startsWith('/user/email-verification')) methods = [];


  if (methods.includes(req.method)) {
    let canContinue = false;

    // Admin routes
    if(req.originalUrl.startsWith('/admin') && !req.isAdmin) canContinue = false;
    else canContinue = true;

    if (!canContinue) {
      res.status(UNAUTHORIZED).send();
      return;
    }
  }


  next();
};
