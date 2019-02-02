import React from 'react';
import DonationEventDate from '../../../donation/donation-details/events/event-date';

function NotificationDonationStatistics({ notification }) {

  const computeCssClass = () => {
    let cssClass = 'notification donation-statistics';
    if (this.props.notRead) cssClass = cssClass.concat(' not-read');
    return cssClass;
  }

  return (
    <li className={computeCssClass()}>
      <p>Votre don vient d'être ajouté aux statistiques des participants et globales au site. Il vous est désormais impossible de le modifier.<br /><DonationEventDate date={notification.date} /></p>
    </li>
  );
}

export default NotificationDonationStatistics;