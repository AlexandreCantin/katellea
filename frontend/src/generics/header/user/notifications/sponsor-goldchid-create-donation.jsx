import React from 'react';
import { Link } from '@reach/router';
import DonationEventDate from '../../../donation/donation-details/events/event-date';

function NotificationSponsorGolchildCreateDonation({ notification }) {
  const author = notification.author;

  const computeCssClass = () => {
    let cssClass = 'notification sponsor-goldchild-create-donation';
    if (this.props.notRead) cssClass = cssClass.concat(' not-read');
    return cssClass;
  }

  return (
    <li className={computeCssClass()}>
      <Link to="/tableau-de-bord" title="Consulter votre tableau pour découvrir cette proposition de don">
        <strong><strong>{author.name}</strong> a créé une nouvelle proposition de don que vous pouvez rejoindre !</strong><br />
        Nous vous invitons à consulter votre tableau de bord pour découvrir cette proposition de don.
          <br /><DonationEventDate date={notification.date} />
      </Link>
    </li>
  );
}

export default NotificationSponsorGolchildCreateDonation;
