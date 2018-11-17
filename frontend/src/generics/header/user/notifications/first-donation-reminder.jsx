import React, { Component } from 'react';
import DonationEventDate from '../../../../pages/donation/events/event-date';

export default class NotificationFirstDonationReminder extends Component {

  computeCssClass() {
    let cssClass = 'notification first-donation-reminder';
    if (this.props.notRead) cssClass = cssClass.concat(' not-read');
    return cssClass;
  }

  showAdviceModal = (e) => {
    e.preventDefault();
    this.props.showAdviceModal();
  }

  render() {
    const { notification } = this.props;

    return (
      <li className={this.computeCssClass()}>
        <button className="reset" onClick={this.showAdviceModal}>
          <strong>Dans deux jours</strong>, vous allez effectuer votre premier don et nous vous remercions par avance !<br />
          Cliquer ici pour des conseils de dernière minute !<br />
          <DonationEventDate date={notification.date} />
        </button>
      </li>
    );
  }
}