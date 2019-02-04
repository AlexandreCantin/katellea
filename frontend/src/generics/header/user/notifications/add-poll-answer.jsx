import React, { Component } from 'react';
import { Link } from '@reach/router';
import cx from 'classnames';
import PropTypes from 'prop-types';

import store from '../../../../services/store';
import DonationEventDate from '../../../donation/donation-details/events/event-date';

export default class NotificationAddPollAnswer extends Component {
  static propTypes = {
    notification: PropTypes.object.isRequired,
    notRead: PropTypes.bool.isRequired
  };

  renderNotificationContent(notification) {
    const author = notification.author;
    return (<p><strong>{author.name}</strong> a répondu au sondage,<br /><DonationEventDate date={notification.date} /></p>);
  }

  render() {
    const { notification } = this.props;
    const isCurrentDonation = +store.getState().user.currentDonation === +this.props.notification.donationId;
    const cssClass = cx('notification add-poll-answer', { 'not-read': this.props.notRead });

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