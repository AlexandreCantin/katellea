import React, { Component } from 'react';
import dayjs from 'dayjs';

import { UserService } from '../../../services/user/user.service';
import { dateFormatDayMonthYear, dateFormatLongDayDayMonthYear } from '../../../services/date-helper';
import Modal from '../../modal';
import Validators from '../../../services/forms/validators';
import { Form, Field } from 'react-final-form';
import { validateForm } from '../../../services/forms/validate';

const CONTRADICTIONS = [
  { name: 'Infection, prise d\'antibiotique ou fièvre de plus de 38°C', days: 14, label: '2 semaines' },
  { name: 'Vaccin', days: 28, label: '4 semaines' },
  { name: 'Intervention chirurgicale', days: 120, label: '4 mois' },
  { name: 'Examen endoscopique ', days: 120, label: '4 mois' },
  { name: 'Tatouage ou percings', days: 120, label: '4 mois' },
  { name: 'Accouchement', days: 180, label: '6 mois' },
  { name: 'Relation sexuelle avec plusieurs partenaires différents', days: 120, description: 'Ne s\'applique pas aux femmes ayant eu des relations avec d\'autres femmes', label: '4 mois' },
  { name: 'Relation sexuelle avec un partenaire ayant lui-même un autre partenaire dans les 4 derniers mois', days: 120, description: 'Ne s\'applique pas aux femmes ayant eu des relations avec d\'autres femmes', label: '4 mois' },
  { name: 'Relation sexuelle entre hommes', days: 365, description: 'Don de plasma reste possible', label: '12 mois' },
  { name: 'Relation sexuelle en échange d\'argent et/ou drogue', days: 365, label: '12 mois' },
  { name: 'Relation sexuelle avec une personne atteinte de VIH, l’hépatite virale B ou C', days: 365, label: '12 mois' },
  { name: 'Relation sexuelle avec partenaire ayant eu lieu une relation sexuelle en échange d\'argent et/ou drogue', days: 365, label: '12 mois' },
];

const FORM_RULES = {
  eventType: [Validators.required(), Validators.numeric(), Validators.maxInteger(CONTRADICTIONS.length - 1)],
  eventDate: [Validators.required(), Validators.dateBeforeToday()]
}

const FORM_DATE_RULES = {
  date: [Validators.required(), Validators.dateAfterToday()]
}

// Do useHover/useState
export default class MinimumDateItem extends Component {

  constructor(props) {
    super(props);

    this.eventTypeRef = React.createRef();
    this.eventDateRef = React.createRef();

    this.state = {
      hover: false,

      userCanMakeDonation: MinimumDateItem.userCanMakeDonation(this.props),
      minimumDateModal: false
    };
  }

  static getDerivedStateFromProps(nextProps, currentState) {
    currentState.userCanMakeDonation = MinimumDateItem.userCanMakeDonation(nextProps);
    return currentState;
  }


  static userCanMakeDonation(props) {
    // False is minimumDate is in the future
    let today = dayjs();
    return dayjs(props.user.minimumDate).isBefore(today);
  }

  createLinkTitle() {
    return this.state.userCanMakeDonation ? 'Indiquer une indisponibilité' : 'Modifier votre indisponibilité';
  }

  // Modal
  showMinimumDateModal = () => this.setState({ minimumDateModal: true });
  closeMinimumDateModal = () => this.setState({ minimumDateModal: false });

  computeNewMinimumDate() {
    let eventIndex = +this.eventTypeRef.current.value;
    let deltaInDays = CONTRADICTIONS[eventIndex].days;
    let beginDate = this.eventDateRef.current.value;

    return dayjs(beginDate).add(deltaInDays, 'day');
  }

  updateUser = () => {
    let newMinimumDate = this.computeNewMinimumDate();
    UserService.updateUser({ minimumDate: newMinimumDate });
    this.closeMinimumDateModal();
  }

  updateUserWithAbsoluteDate = (values) => {
    UserService.updateUser({ minimumDate: values.date });
    this.closeMinimumDateModal();
  }

  expandMenu = () => { if (!this.state.hover) this.setState({ hover: true }); }
  hideMenu = () => { if (this.state.hover) this.setState({ hover: false }); }
  toggleHover = () => this.setState({ hover: !this.state.hover });

  // RENDER
  renderMinimumDateText() {
    const newDate = dateFormatLongDayDayMonthYear(this.computeNewMinimumDate());
    let eventIndex = +this.eventTypeRef.current.value;
    let contradictions = CONTRADICTIONS[eventIndex];

    return (
      <div className="alert info">
        Vous pourrez faire un nouveau à partir du {newDate}, soit une indisponibilité de {contradictions.label}.<br />
        {contradictions.description ? contradictions.description : null}
      </div>
    );
  }

  renderMinimumDateModal() {
    return (
      <Modal title={this.createLinkTitle()} onClose={this.closeMinimumDateModal} modalUrl="/indiquer-une-indisponibilite" cssClass="minimum-date">

        <Form
          onSubmit={this.updateUser}
          validate={values => validateForm(values, FORM_RULES)}
          render={({ handleSubmit, invalid, valid }) => (
            <form className="form" onSubmit={handleSubmit}>
              <fieldset>
                <legend>En indiquant un évènement</legend>

                <div className="alert danger text-center">
                  Seule la date de fin d'indisponibilité est conservée.<br />
                  L'évènement ainsi que sa date n'étant pas conservés, <strong>nous ne pouvons pas les déduire.</strong>
                </div>

                <Field name="eventType" type="select">
                  {({ input, meta }) => (
                    <div className="form-line">
                      <label htmlFor="event-type">Type d'évènement<span>*</span></label>
                      <select {...input} id="event-type" name="eventType" ref={this.eventTypeRef}>
                        <option value="">&nbsp;</option>
                        {CONTRADICTIONS.map((contradiction, index) => <option key={index} value={index}>{contradiction.name}</option>)}
                      </select>

                      {
                        meta.error && meta.touched ?
                          <div className="alert error">
                            {meta.error === 'required' ? <div>Ce champs est requis</div> : null}
                          </div> : null
                      }
                    </div>
                  )}
                </Field>

                <Field name="eventDate">
                  {({ input, meta }) => (
                    <div className="form-line">
                      <label htmlFor="event-date">Date approximative de l'évènement<span>*</span>(ou de fin de l'évènement)</label>
                      <input {...input} id="event-date" name="eventDate" type="date" ref={this.eventDateRef} />

                      {
                        meta.error && meta.touched ?
                          <div className="alert error">
                            {meta.error === 'required' ? <div>Ce champs est requis</div> : null}
                            {meta.error === 'dateBeforeToday' ? <div>La date de l'évènement doit être dans le passé.</div> : null}
                          </div> : null
                      }
                    </div>
                  )}
                </Field>
                {valid ? this.renderMinimumDateText() : null}

                <div className="text-center">
                  <label className="sr-only" htmlFor="event-submit">{this.createLinkTitle()}</label>
                  <input id="event-submit" className="btn" type="submit" value={this.createLinkTitle()} disabled={invalid} />
                </div>
              </fieldset>

            </form>
          )} />

          <div className="or text-center">ou</div>

          <Form
            onSubmit={this.updateUserWithAbsoluteDate}
            validate={values => validateForm(values, FORM_DATE_RULES)}
            render={({ handleSubmit, invalid }) => (
              <form className="form" onSubmit={handleSubmit}>
                <fieldset>
                  <legend>Indiquer directement une date</legend>

                  <Field name="date">
                    {({ input, meta }) => (
                      <div className="form-line">
                        <label htmlFor="event-date">Nouvelle date d'indisponibilité<span>*</span></label>
                        <input {...input} id="event-date" name="date" type="date" ref={this.eventDateRef} />

                        {
                          meta.error && meta.touched ?
                            <div className="alert error">
                              {meta.error === 'required' ? <div>Ce champs est requis</div> : null}
                              {meta.error === 'dateAfterToday' ? <div>Cette date doit être dans le futur</div> : null}
                            </div> : null
                        }
                      </div>
                    )}
                  </Field>

                  <div className="text-center">
                    <label className="sr-only" htmlFor="date-submit">{this.createLinkTitle()}</label>
                    <input id="date-submit" className="btn" type="submit" value={this.createLinkTitle()} disabled={invalid} />
                  </div>
                </fieldset>
            </form>
          )} />

      </Modal>
    );
  }


  renderMinimumDateDropdown() {
    let cssClasses =  'dropdown list-unstyled';
    if(!this.state.hover) cssClasses +=' sr-only';

    return (
      <ul id="minimum-date-dropdown" className={cssClasses} aria-label="submenu">
        <li>
          <button className="btn reset" onClick={this.showMinimumDateModal}>{this.createLinkTitle()}</button>
        </li>
      </ul>
    );
  }

  render() {
    const { user } = this.props;
    let { userCanMakeDonation, minimumDateModal, hover } = this.state;

    const minimumDate = dateFormatDayMonthYear(user.minimumDate);

    return (
      <div role="menuitem" className="minimum-date dropdown-container" onMouseEnter={this.expandMenu} onMouseLeave={this.hideMenu}>
        <button className="btn reset has-dropdown" aria-haspopup="true" aria-expanded={hover ? 'true' : 'false'} aria-controls="#minimum-date-dropdown" onClick={this.toggleHover}>
          <span className="block"><img src={userCanMakeDonation ? 'icons/header/available.svg' : 'icons/header/unavailable.svg'} alt="" /></span>
          <span>
            {userCanMakeDonation ?
              <span>Disponible pour un nouveau don</span> :
              <span>Pas disponible avant le : <em>{minimumDate}</em></span>}
          </span>
        </button>
        {this.renderMinimumDateDropdown()}
        {minimumDateModal ? this.renderMinimumDateModal() : null}
      </div>
    );
  }
}
