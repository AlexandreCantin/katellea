import { environment } from '../../environment';

import store from '../store';
import { GENDER } from '../../enum';
import { USER_TEMP_ACTIONS } from './user-temp.reducers';
import { GoogleAnalyticsService, GA_DIMENSIONS } from '../google-analytics.service';
import { USER_ACTIONS } from '../user/user.reducers';

class AuthServiceFactory {

  computeConnectURL(origin) {
    if(origin === 'facebook') return `${environment.SERVER_URL}${environment.FACEBOOK_LOGIN_URL}`;
    if(origin === 'twitter') return `${environment.SERVER_URL}${environment.TWITTER_LOGIN_URL}`;
    if(origin === 'google') return `${environment.SERVER_URL}${environment.GOOGLE_LOGIN_URL}`;
    if(origin === 'instagram') return `${environment.SERVER_URL}${environment.INSTAGRAM_LOGIN_URL}`;

  }

  computePopupTitle(origin) {
    return `${origin.charAt(0).toUpperCase() + origin.slice(1)} connexion`;
  }

  async doAuthLogin(origin) {
    let url = this.computeConnectURL(origin);
    window.open(url, this.computePopupTitle(origin), 'scrollbars=yes, width=640, height=640');
    window.addEventListener('message', (event) => {
      if(event.origin !== environment.SERVER_URL) return;

      let profile = JSON.parse(event.data);

      // No account found, so we fill the user temp profile
      if(profile.action === 'register') {
        store.dispatch({
          type: USER_TEMP_ACTIONS.SET_PROFILE,
          data: {
            userID: profile.id,
            origin: profile.origin,
            accessToken: profile.accessToken,
            name: profile.name,
            email: profile.email,
            gender: profile.gender || GENDER.UNKNOWN
          }
        });
      } else if(profile.action === 'login') {
        if (profile.katelleaToken) localStorage.setItem('USER_TOKEN', profile.katelleaToken);

        store.dispatch({
          type: USER_ACTIONS.SET_USER,
          data: profile
        });
      }


      // Set dimension in Google Analytics
      GoogleAnalyticsService.setDimension(GA_DIMENSIONS.REGISTER_ORIGIN, origin);

    }, false);
  }

  dispatchFacebookAuth(userId, accessToken) {
    store.dispatch({
      type: USER_TEMP_ACTIONS.SET_PROFILE,
      data: { userID: userId, accessToken }
    });
  }
}


// Export as singleton
const authService = new AuthServiceFactory();
Object.freeze(authService);
export{ authService as AuthService };