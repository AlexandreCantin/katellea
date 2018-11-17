import React, { Component } from 'react';
import { DONATION_STATUS } from '../../../services/donation/donation';

import { UserService } from '../../../services/user/user.service';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import { navigate } from '@reach/router';
import { DonationService } from '../../../services/donation/donation.service';
import store from '../../../services/store';
import { isEmpty } from '../../../services/helper';
import Modal from '../../../generics/modal';


export default class DonationActions extends Component {

  constructor(props) {
    super(props);

    this.user = store.getState().user;
    this.userHasCurrentDonation = this.user.hasCurrentDonation();

    this.state = {
      showQuitDonationModal: false,
      quitComment: '',
      userHasAnswerPoll: this.isUserAnsweredPoll(),
      userIsAFinalAttendee: this.props.donation.isUserFinalAttendee(this.user.id),

      donationPollOnGoing: this.props.donation.isPollOnGoing(),
      isCreator: this.props.donation.isCreator(this.user.id),
    };
  }

  componentWillMount() {
    this.userStoreUnsubscribeFn = store.subscribe(() => {
      let user = store.getState().user;

      if (!isEmpty(user) && this.userHasCurrentDonation && !store.getState().user.hasCurrentDonation()) {
        this.userHasCurrentDonation = false;
        DonationService.deleteDonation();
        FlashMessageService.createSuccess('Vous avez quitté cette proposition de don !', 'dashboard');
        navigate('/tableau-de-bord');
      }
    });
  }

  componentWillUnmount() {
    this.userStoreUnsubscribeFn();
  }

  componentWillReceiveProps() {
    this.setState({
      userHasAnswerPoll: this.isUserAnsweredPoll(),
      donationPollOnGoing: this.props.donation.isPollOnGoing(),
      userIsAFinalAttendee: this.props.donation.isUserFinalAttendee(this.user.id),
    });
  }

  isUserAnsweredPoll = () => this.props.donation.pollAnswers.filter(pa => pa.author.id === this.user.id).length > 0

  closePoll = (e) => {
    let donation = this.props.donation;
    donation.status = DONATION_STATUS.POLL_ENDED;

    DonationService.saveDonation(donation)
      .then(() => FlashMessageService.createSuccess('Sondage cloturé avec succès. Nous vous invitons à prendre rendez-vous le plus tôt possible pour augmenter vos chances d\'avoir la date voulue.'))
      .catch(() => FlashMessageService.createError('Erreur lors de la fermeture du sondage. Veuillez réessayer ultérieurement.'));
  }

  // QUIT
  quitDonation = (e) => {
    e.preventDefault();
    DonationService.createQuitUserEvent(this.user, this.props.donation, this.state.quitComment);
    UserService.updateUser({ currentDonation: null });
  }

  handleQuitCommentChange = (e) => {
    this.setState({ quitComment: e.target.value });
  }

  showQuitDonationModal = () => this.setState({ showQuitDonationModal: true });
  closeQuitDonationModal = () => this.setState({ showQuitDonationModal: false });

  renderQuitDonationModal() {
    return (
      <Modal cssclassName="quit-donation" title="Se retirer de ce don" onClose={this.closeQuitDonationModal}>
        <form className="form" onSubmit={this.quitDonation}>
          <div className="form-line">
            <label htmlFor="quit-comment">Ajouter un message (optionnel)</label>
            <textarea id="quit-comment" onChange={this.handleQuitCommentChange}></textarea>
          </div>
          <div className="text-center">
            <input className="btn big" type="submit" value="Se retirer du don" />
          </div>
        </form>
      </Modal>
    );
  }
  render() {
    const { isCreator, donationPollOnGoing, showQuitDonationModal, userIsAFinalAttendee } = this.state;

    return (
      <div className="donation-actions">
        <ul className="actions list-unstyled">
          {isCreator && donationPollOnGoing ? <li><button className="btn" onClick={this.closePoll}>Terminer le sondage</button></li> : null}
          {!isCreator && !userIsAFinalAttendee ? <li><button className="btn danger" onClick={this.showQuitDonationModal}>Se retirer de ce don</button></li> : null}
        </ul>

        {showQuitDonationModal ? this.renderQuitDonationModal() : null}
      </div>
    );
  }

}