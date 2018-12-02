import express from 'express';
import sanitize from 'sanitize-html';
import { NOT_FOUND } from 'http-status-codes';

import passport from 'passport';
import FacebookStrategy from 'passport-facebook';
import { AuthService } from '../services/auth.service';
import { JWTService } from '../services/jwt.service';
import User from '../models/user';
import { environment } from '../../conf/environment';

const authRoutes = express.Router();
const facebookData = environment.facebook;

passport.use(new FacebookStrategy({
  clientID: facebookData.appId,
  clientSecret: facebookData.secret,
  callbackURL: facebookData.callbackURL,
  passReqToCallback: true,
  profileFields: ['id', 'first_name', 'last_name', 'gender', 'email', 'birthday']
}, (req, accessToken, refreshToken, profile, done) => {
  return done(null, { profile: profile._json, accessToken });
}
));

const facebookLoginResponse = (req, res) => {
  const cleanProfile = {};
  cleanProfile.accessToken = req.user.accessToken;
  cleanProfile.origin = 'facebook';
  Object.keys(req.user.profile).map(key => cleanProfile[key] = sanitize(req.user.profile[key]));

  return res.render('auth-response', { profile: JSON.stringify(cleanProfile), domain: environment.frontUrl });
};


const facebookConnectWithToken = async (req, res) => {
  let facebookProfile;
  try {
    facebookProfile = await AuthService.getFacebookProfile(req.params.fbToken);
  } catch (err) {
    return res.status(NOT_FOUND).send();
  }
  if (!facebookProfile || !facebookProfile.email) return res.status(NOT_FOUND).send();

  const user = await User.findOne({ email: facebookProfile.email })
    .populate({ path: 'establishment', model: 'Establishment' })
    .populate({ path: 'sponsor', model: 'User', select: User.publicFields });
  if (user == null) return res.status(NOT_FOUND).send();

  user.addKatelleaToken();

  return res.json(user);
};


const rememberMe = async (req, res, next) => {
  const payload = JWTService.decodeAndValidate(req.params.jwtToken);
  if (payload.id) {
    try {

      const user = await User.findById(payload.id)
        .populate({ path: 'establishment', model: 'Establishment' })
        .populate({ path: 'sponsor', model: 'User', select: User.publicFields });
      if (user === null) return res.status(NOT_FOUND).send();
      user.addKatelleaToken();
      return res.json(user);

    } catch (err) {
      // Why ? Create a comment
      // next(err);
    }
  } else {
    res.status(NOT_FOUND).send();
  }
};

const logout = async (req, res) => {
  // http://www.passportjs.org/docs/logout/
  req.logout();
  res.status(200).send();
};


// Routes
authRoutes.get('/facebook-connect/:fbToken', facebookConnectWithToken);
authRoutes.get('/remember-me/:jwtToken', rememberMe);
authRoutes.get('/auth/facebook',
  passport.authenticate('facebook', { session: false, scope: ['email', 'user_friends', 'user_gender', 'user_age_range', 'user_birthday'] }),
  facebookLoginResponse
);
authRoutes.get('/logout', logout);

export default authRoutes;
