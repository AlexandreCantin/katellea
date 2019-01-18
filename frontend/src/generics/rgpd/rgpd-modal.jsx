import React, { Component } from 'react';
import { Form, Field } from 'react-final-form';

import Modal from '../modal';
import { RGPDService } from '../../services/rgpd.service';
import { validateForm } from '../../services/forms/validate';
import Validators from '../../services/forms/validators';
import { Link } from '@reach/router';

const FORM_RULES = {
  required: [Validators.required()],
  tracking: [Validators.required()],
  otherServices: [Validators.required()]
};


export default class RGPDModal extends Component {

  constructor(props) {
    super(props);

    let initialValues = RGPDService.getRGPDValues();
    initialValues.required = true;

    // No RGPD value already saved ? Set all values to 'true'
    if(RGPDService.shouldDisplayRGPD()) Object.keys(initialValues).forEach(field => initialValues[field] = true);

    // Convert to yes/no values
    Object.keys(initialValues).forEach(field => initialValues[field] = initialValues[field] ? 'yes':'no');


    this.state = { initialValues }
  }

  closeModal = () => {
    // Notify parent
    if (this.props.closeModalFn) this.props.closeModalFn();
  }

  acceptRGPD = () => {
    RGPDService.acceptsAll();
    this.closeModal();
  }

  updateGRPDValues = (values) => {
    Object.keys(values).forEach(field => values[field] = values[field] === 'yes' ? true : false);
    RGPDService.updateRGPDConsent(values);
    this.closeModal();
  }


  render() {
    return (
      <Modal title="Politique de confidentialité et utilisation de vos données personnelles" onClose={this.closeModal} modalUrl="/custom-rgpd" cssClass="rgpd-custom">
        { /* TODO: EFS only ?*/}
        <p className="text-center">Katellea s'engage à ne pas communiquer vos données personnelles à des organismes tiers.</p>
        <Form
          onSubmit={this.updateGRPDValues}
          validate={values => validateForm(values, FORM_RULES)}
          initialValues={this.state.initialValues}
          render={({ handleSubmit, invalid }) => (
            <form className="form" onSubmit={handleSubmit}>
              <div className="form-line">
                <div>
                  Données pouvant être collectés dans le cadre du fonctionnement de Katellea :<br />
                  <span>Liste explicite des données personnelles : nom complet, email, sexe, historique des dons réalisés et à venir, commentaires et réponses au sondage des propositions de dons, groupe sanguin et établissement EFS de référence.</span>
                </div>
                <Field name="required" type="radio" value="yes">
                  {({ input }) => (<span className="text-center"><label htmlFor="required-yes">Oui</label><input {...input} id="required-yes" type="radio" disabled /></span>)}
                </Field>
                <Field name="required" type="radio" value="no">
                  {({ input }) => (<span className="text-center"><label htmlFor="required-no">Non</label><input {...input} id="required-no" type="radio" disabled /></span>)}
                </Field>
              </div>

              <div className="form-line">
                <div>
                  Données receuillies pour étudier le comportement des utilisateurs et identifier des axes d'amélioration pour Katellea :<br />
                  <span>Services utilisées : Google Analytics et Hotjar</span>
                </div>
                <Field name="tracking" type="radio" value="yes">
                  {({ input }) => (<span className="text-center"><label htmlFor="tracking-yes">Oui</label><input {...input} id="tracking-yes" type="radio" /></span>)}
                </Field>
                <Field name="tracking" type="radio" value="no">
                  {({ input }) => (<span className="text-center"><label htmlFor="tracking-no">Non</label><input {...input} id="tracking-no" type="radio" /></span>)}
                </Field>
              </div>

              <div className="form-line">
                <div>
                  Services tiers utilisés dans Katellea, sans elles, certaines fonctionnalités seront désactivées :<br />
                  <span>Services tiers : Youtube (vidéos) et OpenStreetMap (cartographie)</span>
                </div>
                <Field name="otherServices" type="radio" value="yes">
                  {({ input }) => (<span className="text-center"><label htmlFor="other-services-yes">Oui</label><input {...input} type="radio" id="other-services-yes" /></span>)}
                </Field>
                <Field name="otherServices" type="radio" value="no">
                  {({ input }) => (<span className="text-center"><label htmlFor="other-services-no">Non</label><input {...input} type="radio" id="other-services-no" /></span>)}
                </Field>
              </div>

              <div className="alert info">
                Après certaines actions, Katellea peut vous rediriger vers des sites tiers (Facebook, Twitter, Instagram et Google principalement).
                Toutefois, étant donné que vous sortez de Katellea, la politique RGPD en vigueur devient celle du site tiers.
              </div>

              <div className="text-center actions">
                <label htmlFor="submit-rgpd" className="sr-only">Modifier mes préférences de cookies</label>
                <input id="submit-rgpd" className="btn big" type="submit" value="Modifier mes préférences de cookies" disabled={invalid}/>

                <Link className="btn more" to="/mentions-legales">En savoir plus sur les cookies</Link>

                <button className="btn" onClick={this.closeModal}>Annuler</button>
              </div>
            </form>
        )} />
      </Modal>
    );
  }
}