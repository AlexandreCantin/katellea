export const getNetworkIds = (user, addUser=true) => {
  const userIds = [];

  if (!user) return [];
  if(addUser) userIds.push(userId);

  user.network.forEach(friendId => userIds.push(friendId));

  return userIds;
};