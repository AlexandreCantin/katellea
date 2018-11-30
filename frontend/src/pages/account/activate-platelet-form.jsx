import React, { Component } from 'react';

import { connect } from 'react-redux';
import { FlashMessageService } from '../../services/flash-message/flash-message.service';
import { UserService } from '../../services/user/user.service';
import { extractKey } from '../../services/helper';

class ActivePlateletForm extends Component {

  enablePlatelet = () => this.updateUser(true);
  disablePlatelet = () => this.updateUser(false);

  updateUser = (isPlateletActive) => {
    UserService.updateUser({ plateletActive: isPlateletActive })
      .then(() => {
        const message = isPlateletActive ? 'Le don de plaquettes est désormais actif pour votre compte' : 'Le don de plaquettes n\'est plus actif pour votre compte';
        FlashMessageService.createSuccess(message, 'account');
      })
      .catch(() => {
        FlashMessageService.createError('Erreur lors de la mise à jour de votre compte. Veuillez réessayer ultérieurement.', 'account');
      });
  }


  render() {
    const { plateletActive } = this.props;

    return (
      <div className="form block-base">
        <form onSubmit={e => e.preventDefault()}>

          <fieldset>
            <legend>Activer les dons de plaquettes</legend>
            <div className="alert info text-center">Dépendant de votre taux de plaquettes, il est possible que vous ne y soyez pas éligible.</div>

            <div className="text-center">
              {
                plateletActive ?
                  <button className="btn" type="submit" onClick={this.disablePlatelet}>Désactiver le don de plaquettes</button> :
                  <button className="btn" type="submit" onClick={this.enablePlatelet}>Activer le don de plaquettes sur mon profil</button>
              }
            </div>

          </fieldset>
        </form>
      </div>
    );
  }
}

export default connect(state => extractKey(state, 'user.plateletActive'))(ActivePlateletForm);
