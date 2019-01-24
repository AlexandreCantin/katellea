import React, { Component } from 'react';
import DonationEventDate from '../../../donation/donation-details/events/event-date';
import { Link } from '@reach/router';
import store from '../../../../services/store';

export default class NotificationDonationDone extends Component {

  renderNotificationContent(notification) {
    return (<p>Votre don est passé au status <strong>réalisé</strong>, vous avez désormais 5 jours pour modifier les participants finals au don (si besoin).<br /><DonationEventDate date={notification.date} /></p>);
  }

  computeCssClass() {
    let cssClass = 'notification donation-done';
    if (this.props.notRead) cssClass = cssClass.concat(' not-read');
    return cssClass;
  }

  render() {
    const { notification } = this.props;
    const isCurrentDonation = +store.getState().user.currentDonation === +this.props.notification.donationId;
    const cssClass = this.computeCssClass();

    if (isCurrentDonation) {
      return (
        <li className={cssClass}>
          <Link to="/don-courant" title="Consulter votre proposition de don">{this.renderNotificationContent(notification)}</Link>
        </li>
      );
    }

    return (
      <li className={cssClass}>{this.renderNotificationContent(notification)}</li>
    );
  }
}