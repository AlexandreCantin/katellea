import React, { Component } from 'react';
import PhoneLink from '../../phone-link';
import { GoogleAnalyticsService } from '../../../services/google-analytics.service';
import { computeTabAttributes, computeTabPanelAttributes } from '../../../services/tab-helper';

require('./establishment-card.scss');

// Delta added/removed to map center to get map viewbox
const BBOX_DELTA = 0.01;

const PRESENTATION_TAB = 'presentation';
const OPENING_HOURS_TAB = 'opening-hours';
const CONTACT_TAB = 'contact';
const MAP_TAB = 'map';

export default class EstablishmentCard extends Component {

  constructor(props) {
    super(props);

    const establishment = this.props.establishment;

    this.state = {
      selectTab: PRESENTATION_TAB,
      establishment,
      openStreetMapIframeUrl: EstablishmentCard.generateOpenStreetMapIframeUrl(establishment)
    };
  }

  static getDerivedStateFromProps(nextProps, currentState) {
    if (currentState.establishment.id !== nextProps.establishment.id) {
      currentState.establishment = nextProps.establishment;
      currentState.openStreetMapIframeUrl = EstablishmentCard.generateOpenStreetMapIframeUrl(nextProps.establishment);
    }
    return currentState;
  }

  static generateOpenStreetMapIframeUrl(establishment) {
    const longitude = establishment.coordinates[0];
    const latitude = establishment.coordinates[1];
    return `http://www.openstreetmap.org/export/embed.html?bbox=${longitude + BBOX_DELTA},${latitude + BBOX_DELTA},${longitude - BBOX_DELTA},${latitude - BBOX_DELTA}&layer=mapnik&marker=${latitude},${longitude}`;
  }


  cssClass = (tabName) => {
    let cssClasses = 'reset text-center';
    return this.state.selectTab === tabName ? cssClasses.concat(' selected') : cssClasses;
  }

  selectTab = (e) => {
    const target = e.target.id;
    GoogleAnalyticsService.sendEvent('dashboard-establishment-tab', target, 'Select ' + target);
    this.setState({ selectTab: target });
  }

  // RENDER
  renderAppointment(value) {
    return value ? '(sur rendez-vous)' : '(sans rendez-vous)';
  }
  renderPresentation(establishment) {
    return (
      <div  {...computeTabPanelAttributes(PRESENTATION_TAB)}>
        <h5>Adresse</h5>
        <p>{establishment.address}</p>
        <h5>Dons possibles</h5>
        <ul>
          {establishment.bloodAvailable ? <li>Sang {this.renderAppointment(establishment.bloodAppointement)}</li> : null}
          {establishment.plasmaAvailable ? <li>Plasma {this.renderAppointment(establishment.plasmaAppointement)}</li> : null}
          {establishment.plateletAvailable ? <li>Plaquettes {this.renderAppointment(establishment.plateletAppointement)}</li> : null}
        </ul>
      </div>);
  }
  renderOpeningHours(establishment) {
    return (
      <div {...computeTabPanelAttributes(OPENING_HOURS_TAB)}>
        <h5>Horaires d'ouverture</h5>
        <ul>
          <li>Lundi : {establishment.mondayHours}</li>
          <li>Mardi : {establishment.tuesdayHours}</li>
          <li>Mercredi : {establishment.wenesdayHours}</li>
          <li>Jeudi : {establishment.thursdayHours}</li>
          <li>Vendredi : {establishment.fridayHours}</li>
          <li>Samedi : {establishment.sathurdayHours}</li>
        </ul>
        {establishment.efsComment ? <p>{establishment.efsComment}</p> : null}
      </div>);
  }
  renderContact(establishment) {
    return (
      <div {...computeTabPanelAttributes(CONTACT_TAB)}>
        <ul>
          <li>Téléphone : <PhoneLink establishment={establishment} /></li>
          {establishment.email ? <li>E-mail: {establishment.email}</li> : null}
        </ul>
      </div>);
  }
  renderMap(establishment) {
    return (
      <div className="tab-map" aria-hidden="true">
        <iframe title={"Carte de localisation de l'établissement : " + establishment.name} src={this.state.openStreetMapIframeUrl}>&nbsp;</iframe>
      </div>
    );
  }
  render() {
    const { selectTab, establishment } = this.state;

    return (
      <div className="establishment-card">
        <div className="text">
          <div className="title">
            <h3>{establishment.name}</h3>
          </div>
          <div>

            <div className="establishment-view" role="tablist">
              <button {...computeTabAttributes(PRESENTATION_TAB, selectTab, this.cssClass(PRESENTATION_TAB))} onClick={this.selectTab}>Présentation</button>
              <button {...computeTabAttributes(OPENING_HOURS_TAB, selectTab, this.cssClass(OPENING_HOURS_TAB))} onClick={this.selectTab}>Horaires</button>
              <button {...computeTabAttributes(CONTACT_TAB, selectTab, this.cssClass(CONTACT_TAB))} onClick={this.selectTab}>Contact</button>
              <button id={MAP_TAB} onClick={this.selectTab} className={this.cssClass(CONTACT_TAB)} aria-hidden="true">Carte</button>
            </div>

            {selectTab === PRESENTATION_TAB ? this.renderPresentation(establishment) : null}
            {selectTab === OPENING_HOURS_TAB ? this.renderOpeningHours(establishment) : null}
            {selectTab === CONTACT_TAB ? this.renderContact(establishment) : null}
            {selectTab === MAP_TAB ? this.renderMap(establishment) : null}

          </div>


        </div>
      </div>
    );
  }
}