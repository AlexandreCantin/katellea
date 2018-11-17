import React from 'react';
import { Link } from '@reach/router';
import DonationEventDate from '../../../../pages/donation/events/event-date';

function NotificationEligibleNewDonation({ notification, notRead }) {

  const computeCssClass = () => {
    let cssClass = 'notification eligible-new-donation';
    if (notRead) cssClass = cssClass.concat(' not-read');
    return cssClass;
  }

  return (
    <li className={computeCssClass()}>
      <Link to="/tableau-de-bord" title="Consulter votre tableau pour créer ou rejoindre une proposition de don">
        <strong>Dans environ 3 semaines, vous êtes de nouveau en capacité de réaliser un nouveau don !</strong><br />
        Nous vous invitons à consulter votre tableau de bord pour créer ou rejoindre une proposition de don.<br />
        <DonationEventDate date={notification.date} />
      </Link>
    </li>
  );
}

export default NotificationEligibleNewDonation;