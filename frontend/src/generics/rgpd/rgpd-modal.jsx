import React, { Component } from 'react';
import { RGPDService } from '../../services/rgpd.service';
import Modal from '../modal';

export default class RGPDModal extends Component {

  closeModal = () => {
    // Notify parent
    if (this.props.closeModalFn) this.props.closeModalFn();
  }

  denyRGPD = () => {
    RGPDService.setRGPDConsent(false, true);
    this.closeModal();
  }

  acceptRGPD = () => {
    RGPDService.setRGPDConsent(true);
    this.closeModal();
  }

  render() {
    let { showButtons } = this.props;
    if (showButtons === undefined) showButtons = true;

    return (
      <Modal title="Politique de confidentialité et utilisation de vos données personnelles" onClose={this.closeModal} modalUrl="/rgpd">
        <p>Pour utiliser Katellea, vous devez accepter sa Politique de confidentialité.</p>

        <p>
          Katellea dépose des cookies nécessaires au bon fonctionnement du site :<br />
          <ul>
            <li>des cookies de mesure d'audience via les sites Google Analytics et Hotjar</li>
            <li>des cookies techniques pour permettre l'enregistrement de vos préférences ou de l'état de votre interface</li>
          </ul>
        </p>

        <p>Toutes ces informations ont pour but d'assurer le bon fonctionnement du site et nous permettent également d'améliorer l'intérêt et l'ergonomie de nos services.</p>

        { /* TODO: EFS only ?*/}
        <p>Katellea s'engagent à ne pas communiquer vos données personnelles à des organismes tiers.</p>

        {showButtons ?
          <p className="text-center actions">
            <button className="btn" onClick={this.acceptRGPD}>Accepter</button>
            <button className="btn" onClick={this.denyRGPD}>Refuser</button>
          </p> : null
        }
      </Modal>
    );
  }
}