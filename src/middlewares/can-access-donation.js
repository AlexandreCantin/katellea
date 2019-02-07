import { DONATION_VISIBILITY } from '../constants';
import { getCloseNetworkIds, getSmallNetworkIds } from '../helpers/user.helper';

export const canAccessDonation = async (donation, user) => {

  let canAccess = false;

  if (donation.visibility === DONATION_VISIBILITY.PUBLIC) return true;
  if (donation.isPublicDonation) return true;

  let allowedIds = [];
  const creatorId = donation.createdBy._id || donation.createdBy;

  if (donation.visibility === DONATION_VISIBILITY.SMALL_NETWORK) {
    allowedIds = await getSmallNetworkIds(creatorId);
  } else if (donation.visibility === DONATION_VISIBILITY.CLOSE_NETWORK) {
    allowedIds = await getCloseNetworkIds(creatorId);
  }

  const userId = +user.id || +user._id;
  canAccess = allowedIds.includes(userId);
  return canAccess;
};


export const isUserCurrentDonation = async (donation, user) => {
  return user.currentDonationToken = donation.donationToken;
};


export const canEditAsCreator = (donation, user, adminToken) => {
  if(adminToken && donation.adminToken === adminToken) return true;

  const userId = user.id || user._id;
  return +donation.createdBy === +userId;
};

export const canBeUpdated = (donation) => {
  if (donation.statisticsDate) {
    const maxDate = dayjs(donation.statisticsDate);
    const today = dayjs();
    if (today.isAfter(maxDate)) return false;
  }
  return true;
}
