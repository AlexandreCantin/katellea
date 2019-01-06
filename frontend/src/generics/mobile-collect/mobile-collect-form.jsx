import React, { Component } from 'react';

import FlashMessage from '../flash-message';
import Loader from '../loader/loader';

import { FlashMessageService } from '../../services/flash-message/flash-message.service';
import { MobileCollectService } from '../../services/mobile-collect/mobile-collect.service';
import MobileCollectResult from './mobile-collect-result';
import Validators from '../../services/forms/validators';
import { Form, Field } from 'react-final-form';
import { validateForm } from '../../services/forms/validate';

const FORM_RULES = {
  zipcode: [Validators.required(), Validators.numeric(), Validators.minLength(5), Validators.maxLength(5)]
}

export default class MobileCollectSelectForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      requestOccuring: false,
      mobileCollectsSuggestions: []
    };
  }

  // SEARCH
  searchByLocalisation = (e) => {
    e.preventDefault();
    FlashMessageService.deleteFlashMessage();

    navigator.geolocation.getCurrentPosition(async (position) => {
      this.setState({ requestOccuring: true });

      try {
        let mobileCollects = await MobileCollectService.getMobileCollectByLocalisation(position.coords.longitude, position.coords.latitude);
        this.setState({ mobileCollectsSuggestions: mobileCollects });
      } catch (err) {
        this.setState({ mobileCollectsSuggestions: [] });
        FlashMessageService.createError('Erreur lors de la récupération des établissements', 'mobile-collect');
      } finally {
        this.setState({ requestOccuring: false });
      }
    });
  }


  searchByZipcode = async (values) => {
    FlashMessageService.deleteFlashMessage();

    this.setState({ requestOccuring: true });

    try {
      let mobileCollects = await MobileCollectService.getMobileCollectByZipcode(values.zipcode);
      this.setState({ mobileCollectsSuggestions: mobileCollects });
    } catch (err) {
      this.setState({ mobileCollectsSuggestions: [] });
      FlashMessageService.createError('Aucun établissement trouvé dans cette ville', 'mobile-collect');
    } finally {
      this.setState({ requestOccuring: false });
    }
  }


  emitMobileCollect = (event) => {
    event.preventDefault();
    const mobileCollectsId = +event.target.getAttribute('data-id');
    const mobileCollect = this.state.mobileCollectsSuggestions.find(mc => +mc.id === +mobileCollectsId);
    this.props.onSelect(mobileCollect);
  }

  callOnClose = (event) => {
    event.preventDefault();
    this.props.onClose();
  }

  render() {
    const { onClose } = this.props;
    const { requestOccuring, mobileCollectsSuggestions } = this.state;

    return (
      <div id="location-select-form" className="mobile-collect">
        {onClose ? <button className="close" title="Fermer le formulaire de recherche d'une collecte mobile" onClick={this.callOnClose}>x</button> : null}
        <div className="search-form-container">
          <div>
            <button onClick={this.searchByLocalisation} className="btn">Utiliser ma position actuelle</button>
          </div>
          <span>ou</span>
          <Form
            onSubmit={this.searchByZipcode}
            validate={values => validateForm(values, FORM_RULES)}
            render={({ handleSubmit, form, invalid }) => (
              <form className="form" onSubmit={handleSubmit}>
                <Field name="zipcode">
                  {({ input }) => (
                    <>
                      <label htmlFor="zipcode" className="sr-only">Code postal</label>
                      <input {...input} id="zipcode" name="zipcode" type="text" maxLength="5" placeholder="Entrer votre code postal" />
                    </>
                  )}
                </Field>
                <label htmlFor="search-mobile-collect" className="sr-only">Chercher</label>
                <input id="search-mobile-collect" type="submit" className="btn" disabled={invalid} value="Chercher" />
              </form>
            )} />
        </div>

        {/* #Beta */}
        <div className="alert warning">Dans le cadre de la beta, les collectes mobiles sont restreints à la Loire-Atlantique</div>

        <div className="suggestions">
          <FlashMessage scope="mobile-collect" />

          {requestOccuring ? <Loader /> : null}
          {mobileCollectsSuggestions.length > 0 ? <div className="alert info">Liste des collectes les plus proches dans les 7 prochains jours (10 maximum)</div> : null}
          {mobileCollectsSuggestions.map(mc => (
            <div className="suggestion" key={mc.id}>
              <div><MobileCollectResult mobileCollect={mc} /></div>
              <button className="btn" key={mc.id} data-id={mc.id} onClick={this.emitMobileCollect}>Choisir</button>
            </div>
          ))}

        </div>
      </div>
    );
  }
}