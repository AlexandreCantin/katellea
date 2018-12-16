import React, { Component } from 'react';
import Loader from '../../generics/loader/loader';
import FlashMessage from '../../generics/flash-message';

import { UserService } from '../../services/user/user.service';
import { FlashMessageService } from '../../services/flash-message/flash-message.service';

export default class GRPDExport extends Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      exportOnGoing: false
    };
  }

  componentDidMount() {
    UserService.isExportDataOnGoing()
      .then(() => this.setState({ exportOnGoing: true, loading: false }))
      .catch(() => this.setState({ exportOnGoing: false, loading: false }));
  }

  cancelExport = (e) => {
    e.preventDefault();
    FlashMessageService.deleteFlashMessage();

    UserService.cancelExportData()
      .then(() => {
        this.setState({ exportOnGoing: false });
        FlashMessageService.createSuccess('Votre demande a été annulée.', 'grpd-export');
      })
      .catch(() => FlashMessageService.createError('Erreur lors de l\'envoi de votre demande. Veuillez réessayer ultérieurement.', 'grpd-export'));
  }

  askExport = (e) => {
    e.preventDefault();
    FlashMessageService.deleteFlashMessage();

    UserService.askExportData()
      .then(() => {
        this.setState({ exportOnGoing: true });
        FlashMessageService.createSuccess('Nous avons bien reçu votre demande. Vos données seront envoyés dans les 24h à votre adresse e-mail.', 'grpd-export');
      })
      .catch(() => FlashMessageService.createError('Erreur lors de l\'annulation de votre demande. Veuillez réessayer ultérieurement.', 'grpd-export'));
  }

  // RENDER
  renderExportOnGoing() {
    return (
      <>
        <div className="alert info">
          Dans le cadre du <acronym title="Règlement général de protection des données">RGPD</acronym>, vous êtes en droit de demander une copie des données vous concernant.
        </div>
        <div>
          <div className="alert warning">
            Une demande d'export est actuellement en cours. Vous pouvez toutefois l'annuler si vous le souhaitez.
          </div>

          <div className="text-center">
            <button className="btn big danger" onClick={this.cancelExport}>Annuler la demande d'export de vos données</button>
          </div>
        </div>
      </>
    );
  }

  renderExportButton() {
    return (
      <>
        <div className="alert info">
          Dans le cadre du <acronym title="Règlement général de protection des données">RGPD</acronym>, vous êtes en droit de demander une copie des données vous concernant.
        </div>
        <div>
          <div className="text-center">
            <button className="btn big" onClick={this.askExport}>Demander un export de vos données</button>
          </div>
        </div>
      </>
    );
  }

  render() {
    const { loading, exportOnGoing } = this.state;

    return (
      <div id="rgpd-export" className="form block-base">
        <div className="fieldset">
          <div className="legend">Export de vos données</div>

          <FlashMessage scope="grpd-export" />

          { loading ? <Loader /> : null }
          { !loading && exportOnGoing ? this.renderExportOnGoing() : null }
          { !loading && !exportOnGoing ? this.renderExportButton() : null }
        </div>
      </div>
    );
  }
}