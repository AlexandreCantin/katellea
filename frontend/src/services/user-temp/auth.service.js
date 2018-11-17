import { environment } from '../../environment';

import store from '../store';
import { GENDER } from '../../enum';
import { USER_TEMP_ACTIONS } from './user-temp.reducers';

class AuthServiceFactory {

  computeConnectURL(origin) {
    if(origin === 'facebook') return `${environment.SERVER_URL}${environment.FACEBOOK_LOGIN_URL}`;
    if(origin === 'twitter') return `${environment.SERVER_URL}${environment.USER_ENDPOINT_TWITTER_TOKEN}`;
    if(origin === 'google') return `${environment.SERVER_URL}${environment.USER_ENDPOINT_GOOGLE_TOKEN}`;
    if(origin === 'instagram') return `${environment.SERVER_URL}${environment.USER_ENDPOINT_INSTAGRAM_TOKEN}`;

  }

  computePopupTitle(origin) {
    return `${origin.charAt(0).toUpperCase() + origin.slice(1)} connexion`;
  }

  async doAuthLogin(origin) {
    let url = this.computeConnectURL(origin);
    window.open(url, this.computePopupTitle(origin), 'scrollbars=yes, width=640, height=640');
    window.addEventListener('message', (event) => {
      if(!event.origin === environment.SERVER_URL) return;

      let profile = JSON.parse(event.data);
      store.dispatch({
        type: USER_TEMP_ACTIONS.SET_PROFILE,
        data: {
          userID: profile.userID,
          origin: profile.origin,
          accessToken: profile.accessToken,
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: profile.email,
          gender: profile.gender || GENDER.UNKNOWN
        }
      });
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