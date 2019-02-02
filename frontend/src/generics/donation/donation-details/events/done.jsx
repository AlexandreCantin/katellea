import React, { Component } from 'react';

import DonationEventDate from './event-date';

export default class DonationEventDone extends Component {

  render() {
    const event = this.props.event;

    return (
      <div className="event donation-done">
        <p className="block">Votre don vient de passer au statut <strong>réalisé</strong>.</p>
        <p className="block">Le créateur du don a désormais 5 jours pour modifier les participants finals au don (si besoin).</p>
        <p className="block">Passé ce délai, ce don sera comptabilisé dans les statistiques des participants et globales du site.</p>
        <p className="block"><DonationEventDate date={event.date} /></p>
      </div>
    );
  }
}