import React, { Component } from 'react';
import { connect } from 'react-redux';

import EstablishmentCard from '../../../generics/establishment/card/establishment-card';

import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import { UserService } from '../../../services/user/user.service';

import EstablishmentSelectForm from '../../../generics/establishment/select/establishment-select-form';
import { extractKey } from '../../../services/helper';
import Modal from '../../../generics/modal';


class EstablishmentContainer extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showEstablishmentModal: false
    };
  }

  // Modal
  showEstablishmentModal = () => this.setState({ showEstablishmentModal: true });
  closeEstablishmentModal = () => this.setState({ showEstablishmentModal: false });

  // Update user with the selected establishment
  addEstablishment = (establishment) => {
    UserService
      .addEstablishment(establishment)
      .then(() => {
        FlashMessageService.createSuccess("L'établissement a été associé à votre compte", 'dashboard');
        this.closeEstablishmentModal();
      })
      .catch(() => FlashMessageService.createError('Erreur lors de la mise à jour de votre profil', 'establishment'));
  }

  removeEstablishment = () => {
    UserService
      .removeEstablishment()
      .then(() => FlashMessageService.createSuccess("Vous n'êtes plus associé à cet établissement", 'dashboard'))
      .catch(() => FlashMessageService.createError('Erreur lors de la mise à jour de votre profil', 'dashboard'));
  }

  // RENDER
  renderFindEstablishmentModal() {
    return (
      <Modal cssclassName="confirm-delete-modal" title="Trouver votre établissement le plus proche" onClose={this.closeEstablishmentModal}  modalUrl="/don-homosexuel">
        <EstablishmentSelectForm onSelect={this.addEstablishment} />
      </Modal>
    );
  }
  renderEstablishment() {
    return (
      <div className="your-establishment">
        <EstablishmentCard establishment={this.props.establishment} />

        <ul className="actions list-unstyled inline-list">
          <li><button className="btn big" onClick={this.showEstablishmentModal}>Modifier votre établissement</button></li>
          <li><button className="btn danger big" onClick={this.removeEstablishment}>Supprimer cet établissement</button></li>
        </ul>
      </div>
    );
  }
  renderNoEstablishment() {
    return (
      <div className="no-establishment">
        <p>Votre compte n'est rattaché à aucun établissement :</p>
        <button className="btn big" onClick={this.showEstablishmentModal}>Ajouter un établissement</button>
      </div>
    );
  }
  render() {
    const { establishment } = this.props;
    const { showEstablishmentModal } = this.state;

    return (
      <div id="etablishment-item" className="no-padding block-base">
        <h2>Votre établissement EFS</h2>
        {establishment ? this.renderEstablishment() : this.renderNoEstablishment()}
        {showEstablishmentModal ? this.renderFindEstablishmentModal() : null}
      </div>
    );
  }
}

export default connect(state => extractKey(state, 'user.establishment'))(EstablishmentContainer);
