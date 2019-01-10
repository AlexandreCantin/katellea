import express from 'express';
import sanitize from 'sanitize-html';
import { NOT_FOUND, UNAUTHORIZED } from 'http-status-codes';
import fetch from 'node-fetch';
import FormData from 'form-data';


import passport from 'passport';
import FacebookStrategy from 'passport-facebook';
import GoogleStrategy from 'passport-google-oauth2';

import { JWTService } from '../services/jwt.service';
import User from '../models/user';
import { environment } from '../../conf/environment';

import { sendError } from '../helper';

const authRoutes = express.Router();
const facebookData = environment.facebook;
// const twitterData = environment.twitter;
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

/*passport.use(new TwitterStrategy({
  consumerKey: twitterData.apiKey,
  consumerSecret: twitterData.secret,
  callbackURL: twitterData.callbackURL,
  userProfileURL: 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
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
}));*/

// https://console.developers.google.com/apis/credentials
passport.use(new GoogleStrategy({
  clientID:     googleData.clientID,
  clientSecret: googleData.clientSecret,
  callbackURL: googleData.callbackURL,
  passReqToCallback: true
},
function(request, accessToken, refreshToken, profile, done) {
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
  const user = await getUser('google_' + req.user.profile.id);
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
const redirectToInstagram = (req, res) => {
  const url = `https://api.instagram.com/oauth/authorize/?client_id=${instagramData.clientID}&redirect_uri=${instagramData.callbackURL}&response_type=code`
  res.redirect(url);
}

const instagramLoginResponse = async (req, res) => {
  // 1 - Check if code
  console.log(req.query.code);
  if(!req.query.code) return res.status(UNAUTHORIZED).send('Erreur lors de la connexion. Veuillez réessayer.');

  // 2 - Make request to Instagram
  const data = new FormData();
  data.append('client_id', instagramData.clientID);
  data.append('client_secret', instagramData.clientSecret);
  data.append('grant_type', 'authorization_code');
  data.append('redirect_uri', instagramData.callbackURL);
  data.append('code', req.query.code);

  let userData = {}
  try {
    const response = await fetch('https://api.instagram.com/oauth/access_token', { method: 'POST',  body: data });
    if(response.status !== 200) {
      throw new Error(`[${response.status}] ${response.statusText} - ${response.url}`);
    }
    userData = await response.json();
  } catch(err) {
    sendError(err);
    return res.status(UNAUTHORIZED).send('Erreur lors de la connexion. Veuillez réessayer.');
  }

  // 3 - Handle user data
  const profile = userData.user;

  // 3.1 - User exists ?
  const user = await getUser('instagram_' + profile.id);
  if (user !== null) {
    return res.render('auth-response', { profile: generateUserString(user), domain: environment.frontUrl });
  }

  // 3.2 - User not exists
  // Note: Instagram no provide emails...
  const cleanProfile = {
    id: profile.id,
    name: profile.full_name,
    gender: 'UNKNOWN', // Not given by instagram API

    origin: 'instagram',
    action: 'register'
  };

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
  /*authRoutes.get(
    '/auth/twitter',
    passport.authenticate('twitter', { session: false }),
    twitterLoginResponse
  );*/

  // Google
  authRoutes.get(
    '/auth/google',
    passport.authenticate('google', { session: false, scope: [ 'profile', 'email' ] }),
    googleLoginResponse
  );

  // Instagram
  authRoutes.get('/auth/instagram', redirectToInstagram);
  authRoutes.get('/auth/instagram/callback', instagramLoginResponse);


  // Others
  authRoutes.get('/auth/fake/:socialNetworkKey', fakeSocialConnect);
  authRoutes.get('/remember-me/:jwtToken', rememberMe);
  authRoutes.get('/logout', logout);

export default authRoutes;
