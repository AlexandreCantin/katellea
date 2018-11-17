import React, { Component } from 'react';
import Helmet from 'react-helmet';

import Breadcrumb from '../../generics/breadcrumb/breadcrumb';
import HeaderUser from '../../generics/header/user/header-user';
import Menu from '../../generics/menu/menu';
import Loader from '../../generics/loader/loader';

import { DonationService } from '../../services/donation/donation.service';
import { UserService } from '../../services/user/user.service';
import { DONATION_IMAGES } from '../../enum';
import { dateFormatShortDayDayMonthYear } from '../../services/date-helper';
import EscapeLinks from '../../generics/escape-links/escape-links';

require('./donation-history.scss');

export default class DonationHistory extends Component {

  constructor(props) {
    super();

    this.state = {
      donations: [],
      loading: true
    };
  }

  componentWillMount() {
    DonationService.getHistory()
      .then((donations) => this.setState({ loading: false, donations }))
      .catch(() => this.setState({ loading: false }));
  }

  renderNoDonation() {
    return (
      <div className="alert info text-center">Pas de dons enregistrés pour le moment :-(<br />Mais nous avons confiance en vous pour que ce ne soit que temporaire !</div>
    );
  }
  renderDonations() {
    return (
      this.state.donations.map((donation, index) => {
        const img = DONATION_IMAGES[donation.donationType];

        return (
          <div key={index} className="donation">
            <div className="date"><span className="bold">Don effectué le :</span> {dateFormatShortDayDayMonthYear(donation.finalDate)}</div>
            <div className="type">
              <div className="text-center">
                <img src={img.src} alt="" />
                <span>{img.alt}</span>
              </div>
              <div className="info">
                <div><span className="bold">Créé par :</span> {UserService.getFullName(donation.createdBy)}</div>
                <div><span className="bold">Lieu :</span> {donation.establishment ? <span>{donation.establishment.name} - {donation.establishment.address}</span> : <span>{donation.mobileCollect}</span>
                }</div>
              </div>
            </div>
          </div>
        );
      })
    );
  }
  render() {
    const { donations, loading } = this.state;

    return (
      <div id="donation-history" className="page default">
        <Helmet title="Historique des dons" titleTemplate="%s | Katellea" />

        <EscapeLinks links={[
          { href: '#menu', text: 'Menu' },
          { href: '#header', text: 'En-tête de la page' },
          { href: '#main-content', text: 'Contenu principal' },
        ]} />

        <div id="menu" className="sr-only">&nbsp;</div>
        <Menu />

        <main>
          <div id="header" className="sr-only">&nbsp;</div>
          <HeaderUser />

          <div id="main-content" className="sr-only">&nbsp;</div>
          <div className="page-title">
            <div className="title">
              <h1>Historique des dons</h1>
              <Breadcrumb links={[{ href: '/historique-des-dons', text: 'Historique des dons' }]} />
            </div>
          </div>

          <div className="main-content">
            <div className="block-base">
              {loading ? <Loader /> : null}
              {!loading ? (donations.length === 0 ? this.renderNoDonation() : this.renderDonations()) : null}
            </div>
          </div>

        </main>
      </div>
    );
  }
}