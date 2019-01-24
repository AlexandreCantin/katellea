import React, { Component } from 'react';
import store from '../../../../services/store';
import { Link } from '@reach/router';
import DonationEventDate from '../../../donation/donation-details/events/event-date';

export default class NotificationClosePoll extends Component {

  renderNotificationContent(notification) {
    const author = notification.author;
    return (<p><strong>{author.name}</strong> a clotûré le sondage de sa proposition de don,<br /><DonationEventDate date={notification.date} /></p>);
  }

  computeCssClass() {
    let cssClass = 'notification close-poll';
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
          <Link to="/don-courant" title="Consulter cette proposition de don">{this.renderNotificationContent(notification)}</Link>
        </li>
      );
    }

    return (
      <li className={cssClass}>{this.renderNotificationContent(notification)}</li>
    );
  }
}