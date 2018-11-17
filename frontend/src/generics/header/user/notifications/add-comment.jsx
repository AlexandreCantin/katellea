import React, { Component } from 'react';
import DonationEventDate from '../../../../pages/donation/events/event-date';
import store from '../../../../services/store';
import { Link } from '@reach/router';

export default class NotificationAddComment extends Component {

  renderNotificationContent(notification) {
    const author = notification.author;
    return (<p><strong>{author.firstName} {author.lastName}</strong> a commenté votre proposition de don,<br /><DonationEventDate date={notification.date} /></p>);
  }

  computeCssClass() {
    let cssClass = 'notification add-comment';
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
          <Link to="/don-courant" title="Consulter le commentaire ajouté sur votre proposition de don">{this.renderNotificationContent(notification)}</Link>
        </li>
      );
    }

    return (
      <li className={cssClass}>{this.renderNotificationContent(notification)}</li>
    );
  }
}