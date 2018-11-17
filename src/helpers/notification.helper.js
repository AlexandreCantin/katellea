import Notification from '../models/notification';

export const createNotification = async ({ name, forUser, date, donationId, author, data }) => {
  const notification = new Notification();

  if(!name) throw new Error('Missing parameters : name');
  if(!forUser) throw new Error('Missing parameters : forUser');

  notification.name = name;
  notification.forUser = forUser;
  notification.date = date;
  notification.donationId = donationId;
  notification.author = author;
  notification.dataObject = data;
  await notification.save();
};
