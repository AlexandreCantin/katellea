import React, { Component } from 'react';

import { FlashMessageService } from '../../services/flash-message/flash-message.service';
import { UserService } from '../../services/user/user.service';
import { navigate } from '@reach/router';
import Modal from '../../generics/modal';

// useState(false) => showConfirmModal
export default class DeleteAccountForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showConfirmModal: false
    };
  }

  askDeleteConfirm = e => {
    this.setState({ showConfirmModal: true });
  };

  closeDeleteConfirm = e => {
    this.setState({ showConfirmModal: false });
  };

  deleteAccount = e => {
    UserService.deleteKatelleaUser()
      .then(() => {
        UserService.logout();
        FlashMessageService.createSuccess('Votre compte a bien été supprimé', 'account');
        navigate('/');
      })
      .catch(() => {
        FlashMessageService.createError('Erreur lors de la suppression de votre compte', 'account');
      });
  };

  renderConfirmModal() {
    return (
      <Modal cssclassName="confirm-delete-modal" role="alertdialog" title="Supprimer de votre compte ?" onClose={this.closeDeleteConfirm} modalUrl="/mon-compte/supprimer-votre-compte">
        <p>
          Confirmez-vous la suppression de votre compte ?<br />
          Cela entraînera la suppression de votre compte et l'anonymisation de vos dons.
        </p>
        <button className="confirm btn danger big" onClick={this.deleteAccount}>
          Oui, supprimer mon compte sur Katellea
        </button>
      </Modal>
    );
  }

  render() {
    const { showConfirmModal } = this.state;

    return (
      <div className="form block-base">
        <form onSubmit={e => e.preventDefault()}>
          <fieldset>
            <legend>Supprimer mon compte</legend>
            <div className="alert danger text-center">
              Attention ! Cette action est <strong>irréversible</strong>
            </div>

            <div className="text-center">
              <button className="btn danger" onClick={this.askDeleteConfirm}>
                Supprimer mon compte
              </button>
            </div>

            {showConfirmModal ? this.renderConfirmModal() : null}
          </fieldset>
        </form>
      </div>
    );
  }
}
