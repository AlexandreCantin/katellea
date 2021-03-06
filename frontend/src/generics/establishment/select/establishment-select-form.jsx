import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Loader from '../../../generics/loader/loader';
import FlashMessage from '../../flash-message';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import { EstablishmentService } from '../../../services/establishment/establishment.service';

import { Form, Field } from 'react-final-form';
import Validators from '../../../services/forms/validators';
import { validateForm } from '../../../services/forms/validate';
import EstablishmentResult from './establishment-result';

const FORM_RULES = {
  zipcode: [Validators.required(), Validators.numeric(), Validators.minLength(5), Validators.maxLength(5)]
}

export default class EstablishmentSelectForm extends Component {
  static propTypes = { onSelect: PropTypes.func.isRequired }

  constructor(props) {
    super(props);

    this.state = {
      requestOccuring: false,
      establishmentSuggestions: []
    };
  }

  componentDidUpdate() {
    // Notify parent to update their focusable elements (on modal mode only)
    if(this.props.updateFocusableElements) this.props.updateFocusableElements();
  }

  // SEARCH
  searchByLocalisation = (e) => {
    e.preventDefault();
    FlashMessageService.deleteFlashMessage();

    navigator.geolocation.getCurrentPosition(async (position) => {
      this.setState({ requestOccuring: true });

      try {
        let establishments = await EstablishmentService.getEstablishmentByLocalisation(position.coords.longitude, position.coords.latitude);
        this.setState({ establishmentSuggestions: establishments });
      } catch (err) {
        this.setState({ establishmentSuggestions: [] });
        FlashMessageService.createError('Erreur lors de la récupération des établissements', 'establishment');
      } finally {
        this.setState({ requestOccuring: false });
      }
    });
  }


  searchByZipcode = async (values) => {
    FlashMessageService.deleteFlashMessage();

    const zipcode = values.zipcode;
    this.setState({ requestOccuring: true });

    try {
      let establishments = await EstablishmentService.getEstablishmentByZipcode(zipcode);
      this.setState({ establishmentSuggestions: establishments });
    } catch (err) {
      this.setState({ establishmentSuggestions: [] });
      FlashMessageService.createError('Aucun établissement trouvé dans cette ville', 'establishment');
    } finally {
      this.setState({ requestOccuring: false });
    }
  }


  emitEstablishment = (event) => {
    event.preventDefault();
    const establishmentId = +event.target.getAttribute('data-id');
    const establishment = this.state.establishmentSuggestions.find(es => +es.id === +establishmentId);
    this.props.onSelect(establishment);
  }

  callOnClose = (event) => {
    event.preventDefault();
    this.props.onClose();
  }


  render() {
    const { onClose } = this.props;
    const { requestOccuring, establishmentSuggestions } = this.state;

    return (
      <div id="location-select-form" className="establishment">
        {onClose ? <button className="close" title="Fermer le formulaire de recherche de l'établissement" onClick={this.callOnClose}>x</button> : null}
        <div className="search-form-container">
          <div>
            <button onClick={this.searchByLocalisation} className="btn">Utiliser ma position actuelle</button>
          </div>
          <span>ou</span>

          <Form
            onSubmit={this.searchByZipcode}
            validate={values => validateForm(values, FORM_RULES)}
            render={({ handleSubmit, invalid }) => (
              <form className="form" onSubmit={handleSubmit}>
                <Field name="zipcode">
                  {({ input }) => (
                    <>
                      <label htmlFor="zipcode" className="sr-only">Code postal</label>
                      <input {...input} id="zipcode" name="zipcode" type="text" maxLength="5" placeholder="Entrer votre code postal" />
                    </>
                  )}
                </Field>
                <label htmlFor="search-establishment" className="sr-only">Chercher</label>
                <input id="search-establishment" type="submit" className="btn" disabled={invalid} value="Chercher" />
              </form>
            )} />
        </div>

        {/* #Beta */}
        <div className="alert warning">Dans le cadre de la beta, les établissements sont restreints à la <strong>Bretagne et aux Pays de la Loire</strong> uniquement.</div>

        <div className="suggestions">
          <FlashMessage scope="establishment" />

          {requestOccuring ? <Loader /> : null}
          {establishmentSuggestions.map(esta => (
            <div key={esta.id} className="suggestion">
              <div><EstablishmentResult establishment={esta} /></div>
              <button className="btn" key={esta.id} data-id={esta.id} onClick={this.emitEstablishment}>Sélectionner</button>
            </div>
          ))}

        </div>
      </div>
    );
  }
}