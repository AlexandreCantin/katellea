import React, { Component } from 'react';
import PhoneLink from '../../phone-link';

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

    this.state = {
      selectTab: 'presentation',
      openStreetMapIframeUrl: this.generateOpenStreetMapIframeUrl()
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.establishment.id !== nextProps.establishment.id) {
      this.setState({ openStreetMapIframeUrl: this.generateOpenStreetMapIframeUrl(nextProps.establishment) });
    }
  }

  generateOpenStreetMapIframeUrl(establishmentOverride) {
    const establishment = establishmentOverride || this.props.establishment;

    const longitude = establishment.coordinates[0];
    const latitude = establishment.coordinates[1];
    return `http://www.openstreetmap.org/export/embed.html?bbox=${longitude + BBOX_DELTA},${latitude + BBOX_DELTA},${longitude - BBOX_DELTA},${latitude - BBOX_DELTA}&layer=mapnik&marker=${latitude},${longitude}`;
  }


  cssClass = (tabName) => {
    let cssClasses = 'reset text-center';
    return this.state.selectTab === tabName ? cssClasses.concat(' selected') : cssClasses;
  }

  selectTab = (e) => {
    this.setState({ selectTab: e.target.id });
  }

  computeTabAttributes(tabId, selectTab) {
    // https://www.w3.org/TR/wai-aria-practices/examples/tabs/tabs-1/tabs.html
    const isSelected = selectTab === tabId;

    let values = {
      id: tabId,
      'aria-controls': '#' + tabId + '-tab',
      'aria-selected': isSelected,
      className: this.cssClass(tabId)
    };
    if (!isSelected) values.tabIndex = -1;

    return values;
  }
  computeTabPanelAttributes(tabId) {
    // https://www.w3.org/TR/wai-aria-practices/examples/tabs/tabs-1/tabs.html
    return {
      className: 'tab-content',
      role: 'tabpanel',
      tabIndex: 0,
      id: tabId + '-tab',
      'aria-labelledby': tabId
    };
  }

  // RENDER
  renderAppointment(value) {
    return value ? '(sur rendez-vous)' : '(sans rendez-vous)';
  }
  renderPresentation(establishment) {
    return (
      <div  {...this.computeTabPanelAttributes(PRESENTATION_TAB)}>
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
      <div {...this.computeTabPanelAttributes(OPENING_HOURS_TAB)}>
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
      <div {...this.computeTabPanelAttributes(CONTACT_TAB)}>
        <ul>
          <li>Téléphone : <PhoneLink establishment={establishment} /></li>
          {establishment.email ? <li>E-mail</li> : null}
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
    const { establishment } = this.props;
    const { selectTab } = this.state;

    return (
      <div className="establishment-card">
        <div className="map">&nbsp;</div>
        <div className="text">
          <div className="title">
            <h4>{establishment.name}</h4>
          </div>
          <div>

            <div className="establishment-view" role="tablist">
              <button {...this.computeTabAttributes(PRESENTATION_TAB, selectTab)} onClick={this.selectTab}>Présentation</button>
              <button {...this.computeTabAttributes(OPENING_HOURS_TAB, selectTab)} onClick={this.selectTab}>Horaires</button>
              <button {...this.computeTabAttributes(CONTACT_TAB, selectTab)} onClick={this.selectTab}>Contact</button>
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