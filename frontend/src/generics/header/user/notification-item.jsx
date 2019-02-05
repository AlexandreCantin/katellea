import React, { Component } from 'react';
import { connect } from 'react-redux';
import dayjs from 'dayjs';
import cx from 'classnames';

import { extractKey, isEmpty } from '../../../services/helper';
import { NotificationService } from '../../../services/notifications/notification.service';
import { NOTIFICATION_TYPES } from '../../../services/notifications/notification';
import { UserService } from '../../../services/user/user.service';

import NotificationAddPollAnswer from './notifications/add-poll-answer';
import NotificationUpdatePollAnswer from './notifications/update-poll-answer';
import NotificationAddComment from './notifications/add-comment';
import NotificationQuitDonation from './notifications/quit-donation';
import NotificationDonationStatistics from './notifications/donation-statistics';
import NotificationDonationDone from './notifications/donation-done';
import NotificationClosePoll from './notifications/close-poll';
import NotificationFinalDate from './notifications/final-date';

import store from '../../../services/store';
import NotificationEligibleNewDonation from './notifications/eligible-new-donation';
import NotificationFirstDonationReminder from './notifications/first-donation-reminder';
import NotificationSponsorGolchildCreateDonation from './notifications/sponsor-goldchid-create-donation';
import Modal from '../../modal';

const MARK_AS_READ_DELAY = 2000;

class NotificationItem extends Component {
  constructor(props) {
    super(props);

    let lastNotificationReadDate = dayjs(store.getState().user.lastNotificationReadDate);

    this.state = {
      hover: false,

      lastNotificationReadDate,
      showAdviceModal: false,
      notReadNotificationNumber: NotificationItem.computeNotReadNotification(this.props.notifications, lastNotificationReadDate).length
    };
  }

  componentDidMount() {
    NotificationService.getLastNotifications();
  }

  static getDerivedStateFromProps(nextProps, currentState) {
    if (isEmpty(nextProps.notifications)) return currentState;

    let newLastNotificationReadDate = dayjs(nextProps.user.lastNotificationReadDate);
    currentState.lastNotificationReadDate = newLastNotificationReadDate;
    currentState.notReadNotificationNumber = NotificationItem.computeNotReadNotification(nextProps.notifications, newLastNotificationReadDate).length;

    return currentState;
  }

  static computeNotReadNotification(notifications, date) {
    if (isEmpty(notifications)) return [];
    return notifications.filter(notification => dayjs(notification.date).isAfter(date));
  }

  computeClass() {
    return cx('dropdown list-unstyled', { 'sr-only': !this.state.hover })
  }


  markNotificationsAsReadClick = () => {
    if (this.state.notReadNotificationNumber === 0) return;
    UserService.updateLastNotificationReadDate(new Date());
    this.cancelMarkNotificationAsRead();
  }
  onMouseEnter = () => {
    if (!this.state.hover) this.setState({ hover: true });

    // Wait MARK_AS_READ_DELAY seconds before mark notifications as read
    if (this.state.notReadNotificationNumber === 0) return;
    if (this.updateLastNotificationReadFn) return;
    this.updateLastNotificationReadFn = setTimeout(() => UserService.updateLastNotificationReadDate(new Date()), MARK_AS_READ_DELAY);
  }
  onMouseLeave = () => {
    if (this.state.hover) this.setState({ hover: false });

    // Cancel mark notification as read
    clearTimeout(this.updateLastNotificationReadFn);
    this.updateLastNotificationReadFn = undefined;
  }

  toggleHover = () => this.setState({ hover: !this.state.hover });

  // Modal
  showAdviceModal = () => this.setState({ showAdviceModal: true });
  closeAdviceModal = () => this.setState({ showAdviceModal: false });

  // RENDER
  renderFirstDonationAdviceModal() {
    return (
      <Modal cssclassName="advice-modal" title="Votre premier don" onClose={this.closeAdviceModal} modalUrl="/votre-premier-don-conseils">
        <p>Dans deux jours, vous allez effectuer votre premier don du sang et pour cela nous vous remercions par avance !</p>
        <p className="img">
          <img src="/icons/header/identity-card.svg" alt="" />
          <div>
            <strong className="block">Emmenez votre carte d'identité nationale, passeport ou titre de séjour</strong>
            Afin que tout se passe sans encombre, nous vous rappelons d'emmener votre carte nationale d’identité, passeport ou titre de séjour.
          </div>
        </p>
        <p className="double-img">
          <span>
            <img src="/icons/header/water.svg" alt="" />
            <img src="/icons/header/apple.svg" alt="" />
          </span>
          <div>
            <strong className="block">Ne pas venir à jeun</strong>
            Il est inutile de venir à jeun, hydratez-vous correctement et n'hésitez pas à manger un en-cas avant votre don.
          </div>
        </p>
        <p className="img">
          <img src="/icons/header/swimming.svg" alt="" />
          <div>
            <strong className="block">Pas de sport durant 24h</strong>
            Ne prévoyez pas de sport durant les 24h après votre don.
          </div>
        </p>


        <p className="links">
          Pour en savoir plus, nous invitons à consulter ces liens :
          <ul className="inline-list list-unstyled">
            <li><a target="_blank" rel="noreferrer noopener" title="Ouverture dans une nouvelle fenêtre" href="https://dondesang.efs.sante.fr/faq" tr>FAQ du don du sang</a></li>
            <li><a target="_blank" rel="noreferrer noopener" title="Ouverture dans une nouvelle fenêtre" href="https://dondesang.efs.sante.fr/donner-je-donne-pour-la-premiere-fois/premier-don-ce-quil-faut-savoir">Premier don, ce qu'il faut savoir</a></li>
          </ul>
        </p>
        <p className="small"><em>Si cela n'est pas votre premier don, nous vous prions d'ignorer ce message.</em></p>
      </Modal>
    );
  }
  renderNotificationDropdown() {
    if (isEmpty(this.props.notifications)) return;

    return (
      <ul id="notification-item-dropdown" className={this.computeClass()} aria-label="submenu">
        <li className="mark-as-read text-right"><button onClick={this.markNotificationsAsReadClick}>Marquer tout comme lu</button></li>
        {
          this.props.notifications.map(notification => {
            const key = notification.date.toLowerCase();
            const notRead = dayjs(notification.date).isAfter(this.state.lastNotificationReadDate);

            if (notification.type === NOTIFICATION_TYPES.SOMEONE_ADD_POLL_ANSWER_TO_YOUR_DONATION) return <NotificationAddPollAnswer key={key} notification={notification} notRead={notRead} />;
            if (notification.type === NOTIFICATION_TYPES.SOMEONE_UPDATE_POLL_ANSWER_TO_YOUR_DONATION) return <NotificationUpdatePollAnswer key={key} notification={notification} notRead={notRead} />;
            if (notification.type === NOTIFICATION_TYPES.SOMEONE_ADD_COMMENT_TO_YOUR_DONATION) return <NotificationAddComment key={key} notification={notification} notRead={notRead} />;
            if (notification.type === NOTIFICATION_TYPES.SOMEONE_QUIT_YOUR_DONATION) return <NotificationQuitDonation key={key} notification={notification} notRead={notRead} />;
            if (notification.type === NOTIFICATION_TYPES.DONATION_DONE) return <NotificationDonationDone key={key} notification={notification} notRead={notRead} />;
            if (notification.type === NOTIFICATION_TYPES.DONATION_STATISTICS) return <NotificationDonationStatistics key={key} notification={notification} notRead={notRead} />;
            if (notification.type === NOTIFICATION_TYPES.CLOSE_POLL_TO_YOUR_CURRENT_DONATION) return <NotificationClosePoll key={key} notification={notification} notRead={notRead} />;
            if (notification.type === NOTIFICATION_TYPES.FINAL_DATE_TO_YOUR_CURRENT_DONATION) return <NotificationFinalDate key={key} notification={notification} notRead={notRead} />;
            if (notification.type === NOTIFICATION_TYPES.ELIGIBLE_TO_NEW_DONATION) return <NotificationEligibleNewDonation key={key} notification={notification} notRead={notRead} />;
            if (notification.type === NOTIFICATION_TYPES.SPONSOR_OR_GODCHILD_CREATE_DONATION) return <NotificationSponsorGolchildCreateDonation key={key} notification={notification} notRead={notRead} />;
            if (notification.type === NOTIFICATION_TYPES.FIRST_DONATION_REMINDER) return <NotificationFirstDonationReminder key={key} notification={notification} notRead={notRead} showAdviceModal={this.showAdviceModal} />;
            return <li>{notification.type}</li>;
          })
        }
      </ul>
    );
  }
  render() {
    const { notReadNotificationNumber, showAdviceModal, hover } = this.state;

    return (
      <div role="menuitem" className="notifications dropdown-container" onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
        <button className="btn reset has-dropdown" aria-haspopup="true" aria-expanded={hover ? 'true' : 'false'} aria-controls="#notification-item-dropdown" onClick={this.toggleHover}>
          <span>
            {notReadNotificationNumber} <span className="sr-only">notifications non lues</span>
          </span>
          <img className={cx({'ringing': notReadNotificationNumber.length })} src="/icons/header/bell.svg" alt="" />
        </button>
        {this.renderNotificationDropdown()}
        {showAdviceModal ? this.renderFirstDonationAdviceModal() : null}
      </div>
    );
  }
}

export default connect(state => extractKey(state, 'notifications'))(NotificationItem);
