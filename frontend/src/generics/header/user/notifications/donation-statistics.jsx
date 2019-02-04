import React from 'react';
import cx from 'classnames';

import DonationEventDate from '../../../donation/donation-details/events/event-date';

function NotificationDonationStatistics({ notification, notRead }) {

  return (
    <li className={cx('notification donation-statistics', { 'not-read': notRead })}>
      <p>Votre don vient d'être ajouté aux statistiques des participants et globales au site. Il vous est désormais impossible de le modifier.<br /><DonationEventDate date={notification.date} /></p>
    </li>
  );
}

export default NotificationDonationStatistics;