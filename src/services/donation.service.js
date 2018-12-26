import { generateRandomString } from '../helpers/string.helper';
import Donation from '../models/donation';

/**
* Service realted to donation handling
*/
class DonationServiceFactory {

  async generateUniqueToken(length=15) {
    let isUnique = false;
    let token = generateRandomString(length);
    while(!isUnique) {
      const donations = await Donation.find({ token: token });

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
const donationServiceFactory = new DonationServiceFactory();
Object.freeze(donationServiceFactory);
export { donationServiceFactory as DonationService };
