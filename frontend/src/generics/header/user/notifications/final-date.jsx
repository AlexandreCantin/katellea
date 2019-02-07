import React, { Component } from 'react';
import { Link } from '@reach/router';
import cx from 'classnames';
import PropTypes from 'prop-types';

import DonationEventDate from '../../../donation/donation-details/events/event-date';
import store from '../../../../services/store';

export default class NotificationFinalDate extends Component {
  static propTypes = {
    notification: PropTypes.object.isRequired,
    notRead: PropTypes.bool.isRequired
  };

  renderNotificationContent(notification) {
    const author = notification.author;
    return (<p><strong>{author.name}</strong> a indiqué la date définitive de sa proposition de don,<br /><DonationEventDate date={notification.date} /></p>);
  }

  render() {
    const { notification } = this.props;

    const user = store.getState().user;
    const isCurrentDonation = +user.currentDonationToken === +this.props.notification.donationToken;

    const cssClass = cx('notification final-date', { 'not-read': this.props.notRead });

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