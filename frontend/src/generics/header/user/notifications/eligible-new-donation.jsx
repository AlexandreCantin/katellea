import React from 'react';
import { Link } from '@reach/router';
import cx from 'classnames';

import DonationEventDate from '../../../donation/donation-details/events/event-date';

function NotificationEligibleNewDonation({ notification, notRead }) {

  return (
    <li className={cx('notification eligible-new-donation', { 'not-read': notRead })}>
      <Link to="/tableau-de-bord" title="Consulter votre tableau pour créer ou rejoindre une proposition de don">
        <strong>Dans environ 1 semaine, vous pourrez réaliser un nouveau don !</strong><br />
        Nous vous invitons à consulter votre tableau de bord pour créer ou rejoindre une proposition de don.<br />
        <DonationEventDate date={notification.date} />
      </Link>
    </li>
  );
}

export default NotificationEligibleNewDonation;