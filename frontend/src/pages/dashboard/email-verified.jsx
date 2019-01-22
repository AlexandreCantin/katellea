import React, { Component } from 'react';
import store from '../../services/store';
import { UserService, ALREADY_SEND_LAST_HOUR } from '../../services/user/user.service';
import { FlashMessageService } from '../../services/flash-message/flash-message.service';
import FlashMessage from '../../generics/flash-message';

export default class EmailVerified extends Component {

  constructor(props) {
    super(props);

    this.state = {
      user: store.getState().user
    }
  }

  reSendEmailVerifiedEmail = async (e) => {
    e.preventDefault();

    try {
      await UserService.reSendEmailVerifiedEmail();
      FlashMessageService.createSuccess(`Mail de confirmation envoyé à : ${this.state.user.email}`, 'email-verified');
    } catch(err) {
      if(err.message === ALREADY_SEND_LAST_HOUR) {
        const msg = "Une e-mail vous a déjà été envoyé dans la dernière heure. Veuillez consulter votre boîte de réception (et vos courriers indésirables si besoin)";
        FlashMessageService.createError(msg, 'email-verified');
      } else {
        FlashMessageService.createError("Erreur lors de l'envoi du mail de confirmation.", 'email-verified');
      }
    }
  }

  render() {
    const { user } = this.state;

    if(user.emailVerified) return null;

    return (
      <div id="email-verified" className="block-base alert info text-center">
        <FlashMessage scope="email-verified" />

        Votre adresse e-mail n'est pas confirmée. Veuillez consulter votre boîte de réception (et vos courriers indésirables si besoin).

        <div className="text-center">
          <button className="btn big" onClick={this.reSendEmailVerifiedEmail}>Me renvoyer un e-mail de confirmation</button>
        </div>
      </div>
    )
  }
}