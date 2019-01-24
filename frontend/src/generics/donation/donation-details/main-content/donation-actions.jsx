import React, { Component } from 'react';
import { navigate } from '@reach/router';

import { DONATION_STATUS } from '../../../../services/donation/donation';

import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import { DonationService } from '../../../../services/donation/donation.service';
import store from '../../../../services/store';
import { isEmpty } from '../../../../services/helper';
import Modal from '../../../../generics/modal';
import { DONATION_ACTIONS } from '../../../../services/donation/donation.reducers';

export default class DonationActions extends Component {

  constructor(props) {
    super(props);

    const user = store.getState().user;

    this.state = {
      showDeleteDonationModal: false,

      donationPollOnGoing: this.props.donation.isPollOnGoing(),
      user: user,
    };
  }

  static getDerivedStateFromProps(nextProps, currentState) {
    currentState.donationPollOnGoing = nextProps.donation.isPollOnGoing();
    return currentState;
  }

  static isUserAnsweredPoll = (pollAnswers, user) => {
    // Filter only when user is logged
    if(isEmpty(user)) return pollAnswers;

    return pollAnswers.filter(pa => pa.author ? pa.author.id === user.id : false).length > 0;
  }

  closePoll = (e) => {
    let donation = this.props.donation;
    donation.status = DONATION_STATUS.POLL_ENDED;

    DonationService.saveDonation(donation, this.props.adminToken)
      .then(() => FlashMessageService.createSuccess('Sondage cloturé avec succès. Nous vous invitons à prendre rendez-vous le plus tôt possible pour augmenter vos chances d\'avoir la date voulue.'))
      .catch(() => FlashMessageService.createError('Erreur lors de la fermeture du sondage. Veuillez réessayer ultérieurement.'));
  }


  // DELETE DONATION
  deleteDonation = (e) => {
    e.preventDefault();

    DonationService.deleteDonation(this.props.donation, this.props.adminToken)
      .then(() => {
        store.dispatch({ type: DONATION_ACTIONS.DELETE_DONATION });

        if(this.state.user.id) {
          FlashMessageService.createSuccess('Le don a été supprimé', 'dashboard');
          navigate('/tableau-de-bord');
        } else {
          FlashMessageService.createSuccess('Le don a été supprimé', 'homePage');
          navigate('/');
        }
        return;
      })
      .catch(() => FlashMessageService.createError('Erreur lors de la suppression du don. Veuillez réessayer ultérieurement', 'donation'));
  }

  showDeleteDonationModal = () => this.setState({ showDeleteDonationModal: true });
  closeDeleteDonationModal = () => this.setState({ showDeleteDonationModal: false });

  renderDeleteDonationModal() {
    return (
      <Modal cssclassName="delete-donation" role="alertdialog" title="Supprimer votre don ?" onClose={this.closeDeleteDonationModal} modalUrl="/donation/supprimer-le-don">
        <div className="text-center">
          <ul className="inline-list list-unstyled">
            <li>
              <button className="confirm btn danger big" onClick={this.deleteDonation}>Oui, je confirme vouloir supprimer ce don</button>
            </li>
            <li>
              <button onClick={this.closeDeleteDonationModal} className="btn small">Annuler</button>
            </li>
          </ul>
        </div>
      </Modal>
    );
  }



  render() {
    const { donationPollOnGoing, showDeleteDonationModal } = this.state;
    const { isAdmin } = this.props;

    return (
      <div className="donation-actions">
        <ul className="actions inline-list list-unstyled">
          {isAdmin ? <li><button onClick={this.showDeleteDonationModal} className="btn danger">Supprimer de don</button></li> : null}
          {isAdmin && donationPollOnGoing ? <li><button className="btn" onClick={this.closePoll}>Terminer le sondage</button></li> : null}
        </ul>

        { showDeleteDonationModal ? this.renderDeleteDonationModal() : null}
      </div>
    );
  }

}