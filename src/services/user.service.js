import { generateRandomString } from '../helpers/string.helper';
import User from '../models/user';

/**
* Service realted to user handling
*/
class UserServiceFactory {

  async generateUniqueToken(length=10) {
    let isUnique = false;
    let token = generateRandomString(length);
    while(!isUnique) {
      const donations = await User.find({ sponsorToken: token });

      if(donations.length === 0) {
        isUnique = true;
      } else {
        token = generateRandomString(length);
      }
    }
    return token;
  }

}

// Export as singleton
const userServiceFactory = new UserServiceFactory();
Object.freeze(userServiceFactory);
export { userServiceFactory as UserService };
