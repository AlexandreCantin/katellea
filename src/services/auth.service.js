import FB from 'fb';
import { environment } from '../../conf/environment';


const FAKE_EMAILS = [
  { token: 'johndoe', email: 'johnDoe@mail.com' },
  { token: 'manhattan', email: 'manhattan@mail.com' },
  { token: 'jack', email: 'jack@mail.com' },
  { token: 'jamesbond', email: 'jamesBond@mail.com' },
];

/**
 * Service related to interaction with social networks
 */
export default class AuthServiceFactory {

  getFacebookProfile(token) {
    return new Promise((resolve, reject) => {
      if (environment.offlineMode && environment.environment == 'development') {
        const fakeUser = FAKE_EMAILS.find(fake => fake.token === token);
        if(fakeUser) {
          resolve({ email: fakeUser.email });
          return;
        }
      }

      FB.api('/me', { fields: 'email', access_token: token }, user => {
        if(user && user.hasOwnProperty('email')) {
          resolve({ email: user.email });
          return;
        }
        reject();
      });
    });
  }

}

// Export as singleton
const authServiceFactory = new AuthServiceFactory();
Object.freeze(authServiceFactory);
export { authServiceFactory as AuthService };
