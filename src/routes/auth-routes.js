import express from 'express';
import sanitize from 'sanitize-html';
import { NOT_FOUND } from 'http-status-codes';

import passport from 'passport';
import FacebookStrategy from 'passport-facebook';
import TwitterStrategy from 'passport-twitter';
import GoogleStrategy from 'passport-google-oauth2';
import InstagramStrategy from 'passport-instagram';

import { JWTService } from '../services/jwt.service';
import User from '../models/user';
import { environment } from '../../conf/environment';


const authRoutes = express.Router();
const facebookData = environment.facebook;
const twitterData = environment.twitter;
const googleData = environment.google;
const instagramData = environment.instagram;


passport.use(new FacebookStrategy({
  clientID: facebookData.appId,
  clientSecret: facebookData.secret,
  callbackURL: facebookData.callbackURL,
  passReqToCallback: true,
  profileFields: ['id', 'first_name', 'last_name', 'gender', 'email', 'birthday']
}, (req, accessToken, refreshToken, profile, done) => {
  return done(null, { profile: profile._json });
}));

passport.use(new TwitterStrategy({
  consumerKey: twitterData.apiKey,
  consumerSecret: twitterData.secret,
  callbackURL: `${environment.baseUrl}/auth/twitter`,
  userProfileURL: 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true'
}, function(accessToken, tokenSecret, profile, cb, done) {
  let email = '';
  if(cb.emails) email = cb.emails[0].value;

  const profileData = {
    userID: cb.id,
    name: cb.displayName,
    email: email,
    origin: 'twitter',
  };

  return done(null, { profile: profileData });

}));

// https://console.developers.google.com/apis/credentials
passport.use(new GoogleStrategy({
  clientID:     googleData.clientID,
  clientSecret: googleData.clientSecret,
  callbackURL: '/auth/google',
  passReqToCallback: true
},
function(request, accessToken, refreshToken, profile, done) {
  return done(null, { profile: profile._json });
}));

passport.use(new InstagramStrategy({
  clientID:     instagramData.clientID,
  clientSecret: instagramData.clientSecret,
  callbackURL: '/auth/instagram',
},
function(accessToken, refreshToken, profile, done) {
  return done(null, { profile: profile._json });
}));


/*************
 * FACEBOOK  *
 * ***********/
const facebookLoginResponse = async (req, res) => {

  // User exists ?
  const user = await getUser('facebook_' + req.user.profile.id);
  if (user !== null) {
    return res.render('auth-response', { profile: generateUserString(user), domain: environment.frontUrl });
  }

  // User not exists
  const firstName = req.user.profile.first_name || '';
  const lastName = req.user.profile.last_name || '';

  const cleanProfile = {
    id: req.user.profile.id,
    email: req.user.profile.email || '',
    name: firstName + ' ' + lastName,
    gender: req.user.profile.gender,
    origin: 'facebook'
  };

  return res.render('auth-response', { profile: generateProfileString(sanitizeObj(cleanProfile)), domain: environment.frontUrl });
};


/*************
 * TWITTER ***
 * ***********/
const twitterLoginResponse = async (req, res) => {
  // User exists ?
  const user = await getUser('twitter_' + req.user.profile.userID);
  if (user !== null) {
    return res.render('auth-response', { profile: generateUserString(user), domain: environment.frontUrl });
  }

  // User not exists
  const cleanProfile = {
    id: req.user.profile.userID,
    email: req.user.profile.email || '',
    name: req.user.profile.name,

    origin: 'twitter',
    action: 'register'
  };

  return res.render('auth-response', { profile: generateProfileString(sanitizeObj(cleanProfile)), domain: environment.frontUrl });
};

/*************
 * GOOGLE ****
 * ***********/
const googleLoginResponse = async (req, res) => {
  // User exists ?
  const user = await getUser('google_' + req.user.profile.userID);
  if (user !== null) {
    return res.render('auth-response', { profile: generateUserString(user), domain: environment.frontUrl });
  }

  // Adapt Google gender style to the Facebook gender style
  let gender = 'UNKNOWN';
  if(req.user.profile.gender === 'male') gender = 'MALE';
  else if(req.user.profile.gender === 'female') gender = 'FEMALE';

  const cleanProfile = {
    id: req.user.profile.id,
    email: req.user.profile.emails[0].value || '',
    name: req.user.profile.displayName,
    gender,

    origin: 'google',
    action: 'register'
  };

  return res.render('auth-response', { profile: generateProfileString(sanitizeObj(cleanProfile)), domain: environment.frontUrl });
};


/*************
 * INSTAGRAM *
 * ***********/
const instagramLoginResponse = async (req, res) => {
  // User exists ?
  const user = await getUser('instagram_' + req.user.profile.data.id);
  if (user !== null) {
    return res.render('auth-response', { profile: generateUserString(user), domain: environment.frontUrl });
  }

  let email = '';
  if(req.user.profile.emails) email = req.user.profile.emails[0].value;

  const cleanProfile = {
    id: req.user.profile.data.id,
    email: email,
    name: req.user.profile.data.full_name,
    gender: 'UNKNOWN', // Not given by instagram API

    origin: 'instagram',
    action: 'register'
  };

  Object.keys(cleanProfile).map(key => cleanProfile[key] = sanitize(cleanProfile[key]));

  return res.render('auth-response', { profile: generateProfileString(sanitizeObj(cleanProfile)), domain: environment.frontUrl });
};


/****************
 * OTHER ROUTES *
 ****************/
const logout = async (req, res) => {
  // http://www.passportjs.org/docs/logout/
  req.logout();
  res.status(200).send();
};

const rememberMe = async (req, res, next) => {
  const payload = JWTService.decodeAndValidate(req.params.jwtToken);
  if (payload.id) {
    try {

      const user = await User.findById(payload.id)
        .populate({ path: 'establishment', model: 'Establishment' })
        .populate({ path: 'sponsor', model: 'User', select: User.publicFields });

      if (user === null) throw new Error('No user');

      user.addKatelleaToken();
      return res.json(user);
    } catch (err) {
      return res.status(NOT_FOUND).send();
    }
  } else {
    res.status(NOT_FOUND).send();
  }
};

const fakeSocialConnect = async (req, res, next) => {
  // FOR DEV ONLY
  if (environment.offlineMode && environment.environment == 'development') {
    const user = await User.findOne({ socialNetworkKey: req.params.socialNetworkKey })
      .populate({ path: 'establishment', model: 'Establishment' })
      .populate({ path: 'sponsor', model: 'User', select: User.publicFields });
    if (user !== null) {
      user.addKatelleaToken();
      return res.json(user);
    }
  }
  return res.status(NOT_FOUND).send();
}


/**********
 * HELPER *
 **********/
const getUser = async(socialNetworkKey) => {

  const user = await User.findOne({ socialNetworkKey })
    .populate({ path: 'establishment', model: 'Establishment' })
    .populate({ path: 'sponsor', model: 'User', select: User.publicFields });

    if(user) user.addKatelleaToken()
    return user;
}

const generateProfileString = (profile) => {
  profile.action = 'register';
  return JSON.stringify(profile);
}
const generateUserString = (user) => {
  const userObj = user.toJSON();
  userObj.action = 'login';
  return JSON.stringify(userObj);
}

const sanitizeObj = (obj) => {
  Object.keys(obj).map(key => obj[key] = sanitize(obj[key]));
  return obj;
}

// Routes
  // Facebook
  authRoutes.get(
    '/auth/facebook',
    passport.authenticate('facebook', { session: false, scope: ['email', 'user_gender', 'user_age_range', 'user_birthday'] }),
    facebookLoginResponse
  );

  // Twitter
  authRoutes.get(
    '/auth/twitter',
    passport.authenticate('twitter', { session: false }),
    twitterLoginResponse
  );

  // Google
  authRoutes.get(
    '/auth/google',
    passport.authenticate('google', { session: false, scope: [ 'profile', 'email' ] }),
    googleLoginResponse
  );

  // Instagram
  authRoutes.get(
    '/auth/instagram',
    passport.authenticate('instagram', { session: false }),
    instagramLoginResponse
  );


  // Others
  authRoutes.get('/auth/fake/:socialNetworkKey', fakeSocialConnect);
  authRoutes.get('/remember-me/:jwtToken', rememberMe);
  authRoutes.get('/logout', logout);

export default authRoutes;
