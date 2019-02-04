import React, { Component } from 'react';
import DonationEventDate from '../../../donation/donation-details/events/event-date';
import cx from 'classnames';
import PropTypes from 'prop-types';

export default class NotificationFirstDonationReminder extends Component {
  static propTypes = {
    notification: PropTypes.object.isRequired,
    notRead: PropTypes.bool.isRequired,
    showAdviceModal: PropTypes.func.isRequired
  };

  showAdviceModal = (e) => {
    e.preventDefault();
    this.props.showAdviceModal();
  }

  render() {
    const { notification } = this.props;

    return (
      <li className={cx('notification first-donation-reminder', { 'not-read': this.props.notRead })}>
        <button className="reset" onClick={this.showAdviceModal}>
          <strong>Dans deux jours</strong>, vous allez effectuer votre premier don et nous vous remercions par avance !<br />
          Cliquer ici pour des conseils de dernière minute !<br />
          <DonationEventDate date={notification.date} />
        </button>
      </li>
    );
  }
}