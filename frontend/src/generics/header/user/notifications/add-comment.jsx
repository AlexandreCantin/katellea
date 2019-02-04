import React, { Component } from 'react';
import { Link } from '@reach/router';
import cx from 'classnames';

import DonationEventDate from '../../../donation/donation-details/events/event-date';
import store from '../../../../services/store';

export default class NotificationAddComment extends Component {

  renderNotificationContent(notification) {
    const author = notification.author;
    return (<p><strong>{author.name}</strong> a commenté votre proposition de don,<br /><DonationEventDate date={notification.date} /></p>);
  }

  render() {
    const { notification } = this.props;
    const isCurrentDonation = +store.getState().user.currentDonation === +this.props.notification.donationId;
    const cssClass = cx('notification add-comment', { 'not-read': this.props.notRead });

    if (isCurrentDonation) {
      return (
        <li className={cssClass}>
          <Link to="/don-courant" title="Consulter le commentaire ajouté sur votre proposition de don">{this.renderNotificationContent(notification)}</Link>
        </li>
      );
    }

    return (
      <li className={cssClass}>{this.renderNotificationContent(notification)}</li>
    );
  }
}