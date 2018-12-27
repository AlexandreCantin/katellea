import React, { Component } from 'react';
import DonationEventDate from '../../../../pages/donation/events/event-date';
import store from '../../../../services/store';
import { Link } from '@reach/router';

export default class NotificationAddPollAnswer extends Component {

  renderNotificationContent(notification) {
    const author = notification.author;
    return (<p><strong>{author.name}</strong> a répondu au sondage,<br /><DonationEventDate date={notification.date} /></p>);
  }

  computeCssClass() {
    let cssClass = 'notification add-poll-answer';
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