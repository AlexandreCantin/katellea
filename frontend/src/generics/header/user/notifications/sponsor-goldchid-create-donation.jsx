import React from 'react';
import { Link } from '@reach/router';
import cx from 'classnames';

import DonationEventDate from '../../../donation/donation-details/events/event-date';

function NotificationSponsorGolchildCreateDonation({ notification, notRead }) {
  const author = notification.author;

  return (
    <li className={cx('notification sponsor-goldchild-create-donation', { 'not-read': notRead })}>
      <Link to="/tableau-de-bord" title="Consulter votre tableau pour découvrir cette proposition de don">
        <strong><strong>{author.name}</strong> a créé une nouvelle proposition de don que vous pouvez rejoindre !</strong><br />
        Nous vous invitons à consulter votre tableau de bord pour découvrir cette proposition de don.
          <br /><DonationEventDate date={notification.date} />
      </Link>
    </li>
  );
}

export default NotificationSponsorGolchildCreateDonation;
