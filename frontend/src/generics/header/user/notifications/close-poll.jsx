import React, { Component } from 'react';
import { Link } from '@reach/router';
import cx from 'classnames';

import store from '../../../../services/store';
import DonationEventDate from '../../../donation/donation-details/events/event-date';

export default class NotificationClosePoll extends Component {

  renderNotificationContent(notification) {
    const author = notification.author;
    return (<p><strong>{author.name}</strong> a clotûré le sondage de sa proposition de don,<br /><DonationEventDate date={notification.date} /></p>);
  }


  render() {
    const { notification } = this.props;
    const isCurrentDonation = +store.getState().user.currentDonation === +this.props.notification.donationId;
    const cssClass = cx('notification close-poll', { 'not-read': this.props.notRead });

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