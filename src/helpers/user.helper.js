import User from '../models/user';

/**
 *  Small network is composed by :
 *    - User id
 *    - user sponsor
 *    - User sponsored by donation creator
 *    - User sponsored by donation creator sponsor
 **/
export const getSmallNetworkIds = async (userId, addUser=true) => {
  const userIds = [];

  const user = await User.findById(userId);
  if (!user) return [];
  if(addUser) userIds.push(userId);

  // Get godchilds
  const godChilds = await User.find({ sponsor: user._id });
  userIds.push(...godChilds.map(user => user._id));

  // Get sponsor
  if (user.sponsor) {
    const sponsorUser = await User.findById(user.sponsor);
    if (sponsorUser) {
      userIds.push(sponsorUser._id);

      const sponsorGodChilds = await User.find({ sponsorId: sponsorUser._id }).exec();
      userIds.push(...sponsorGodChilds.map(userTemp => userTemp._id));
    }
  }

  return userIds;
};


/**
 *  Small network is composed by :
 *    - User
 *    - User sponsor
 *    - User sponsored by user
 **/
export const getCloseNetworkIds = async (userId, addUser=true) => {
  const userIds = [];

  const user = await User.findById(userId);
  if (!user) return [];
  if(addUser) userIds.push(userId);

  // Get godchilds
  const godChilds = await User.find({ sponsor: user._id });
  userIds.push(...godChilds.map(user => user._id));


  // Get sponsor
  if (user.sponsor) {
    const sponsorUser = await User.findById(user.sponsor);
    if (sponsorUser) userIds.push(sponsorUser._id);
  }

  return userIds;
};
