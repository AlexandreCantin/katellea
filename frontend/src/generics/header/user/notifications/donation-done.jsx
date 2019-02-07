import React, { Component } from 'react';
import { Link } from '@reach/router';
import cx from 'classnames';
import PropTypes from 'prop-types';

import DonationEventDate from '../../../donation/donation-details/events/event-date';
import store from '../../../../services/store';

export default class NotificationDonationDone extends Component {
  static propTypes = {
    notification: PropTypes.object.isRequired,
    notRead: PropTypes.bool.isRequired
  };

  renderNotificationContent(notification) {
    return (<p>Votre don est passé au status <strong>réalisé</strong>, vous avez désormais 5 jours pour modifier les participants finals au don (si besoin).<br /><DonationEventDate date={notification.date} /></p>);
  }

  render() {
    const { notification } = this.props;

    const user = store.getState().user;
    const isCurrentDonation = +user.currentDonationToken === +this.props.notification.donationToken;

    const cssClass = cx('notification donation-done', { 'not-read': this.props.notRead });

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