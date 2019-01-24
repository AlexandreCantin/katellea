import { getParameterByName } from './helper';
import { UserService } from './user/user.service';
import { SHARE_PREFIXES } from '../enum';

export const getSponsorFromUrl = async (addOrign=false) => {
  let result = {};

  let sponsorToken = getParameterByName('sponsor');
  if (sponsorToken) {
    if(addOrign) result.origin = determineOrigin(sponsorToken);
    sponsorToken = removeOrigin(sponsorToken);

    let sponsorUser = await UserService.getSponsorUser(sponsorToken);
    if (sponsorUser) {
      result.sponsorUser = sponsorUser;
    }
  }

  return result;
};


export const determineOrigin = (token) => {
  if(token.startswith(SHARE_PREFIXES.FACEBOOK + '-')) return 'Facebook';
  else if(token.startswith(SHARE_PREFIXES.TWITTER + '-')) return 'Twitter';
  else if(token.startswith(SHARE_PREFIXES.INSTAGRAM + '-')) return 'Instagram';
  else if(token.startswith(SHARE_PREFIXES.DIRECT + '-')) return 'Direct';
  throw new Error(`No origin found for token ${token}`);
};

export const removeOrigin = (token) => {
  let index = token.indexOf('-');
  return index === -1 ? token : token.substring(index + 1);
};

