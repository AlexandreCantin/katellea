import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays'
import { dateFormatYearMonthDay, dateFormatHourMinut } from '../../../services/date-helper';
import { AvailibityWarning, MobileCollectAvailibityWarning } from '../../availibility-warning';


const POLL_SUGGESTION_MAX_SIZE = 5;

export class PollSuggestionsMultipleDay extends Component {
  static defaultProps = { isEdit: false }
  static propTypes = { isEdit: PropTypes.bool }

  render() {
    return (
      <fieldset>
        <legend>{ this.props.isEdit ? 'Proposition de dates' : '4 - Proposition de dates'}</legend>

        <AvailibityWarning />

        <FieldArray name="dateSuggestions">
          {({ fields, meta }) => (
            <>
              <div className="poll-suggestions clearfix">
                <button className="btn" onClick={(e) => { e.preventDefault(); fields.push({ date: dateFormatYearMonthDay(dayjs().add(1, 'day')), dayPart: 'DAY' }) }} disabled={fields.length >= POLL_SUGGESTION_MAX_SIZE}>Ajouter une nouvelle date</button>
              </div>

              {fields.length >= POLL_SUGGESTION_MAX_SIZE ? <div className="alert info">Vous ne pouvez pas ajouter plus de {POLL_SUGGESTION_MAX_SIZE} propositions.</div> : null}

              {fields.map((name, index) => {
                const error = meta.error && meta.error[index] ? meta.error[index].error : undefined;
                return (
                  <div key={name}>
                    <div className="poll-suggestion">
                      <strong>{index + 1} : </strong>
                      <div>
                        <Field name={`${name}.date`}>
                          {({ input }) => (<><input {...input} type="date" id={name + '-hour'} /><label htmlFor={name + '-hour'} className="sr-only">Heure proposé n°{index + 1}</label></>)}
                        </Field>
                      </div>

                      <ul className="list-unstyled inline-list">
                        <li>
                          <Field name={`${name}.dayPart`} value="DAY" type="radio">
                            {({ input }) => (<><input {...input} type="radio" id={name + '-day'} /><label htmlFor={name + '-day'}>Journée</label></>)}
                          </Field>
                        </li>
                        <li>
                          <Field name={`${name}.dayPart`} value="MORNING" type="radio">
                            {({ input }) => (<><input {...input} type="radio" id={name + '-morning'} /><label htmlFor={name + '-morning'}>Matin</label></>)}
                          </Field>
                        </li>
                        <li>
                          <Field name={`${name}.dayPart`} value="AFTERNOON" type="radio">
                            {({ input }) => (<><input {...input} type="radio" id={name + '-afternoon'} /><label htmlFor={name + '-afternoon'}>Après-midi</label></>)}
                          </Field>
                        </li>
                      </ul>
                      {fields.length > 1 ? <button className="btn" onClick={() => fields.remove(index)}>x</button> : null}
                    </div>

                    {error ?
                      <div className="alert error">
                        {error === 'required' ? <div>Cette date n'est pas renseignée</div> : null}
                        {error === 'noFutureDate' ? <div>La date doit être dans le futur</div> : null}
                        {error === 'sameDate' ? <div>Cette date existe déjà</div> : null}
                      </div> : null
                    }
                  </div>
                )
              })}
            </>
          )}
        </FieldArray>
      </fieldset>
    );
  }
}



export class PollSuggestionsOneDay extends Component {
  static defaultProps = { isEdit: false, donation: undefined }
  static propTypes = { isEdit: PropTypes.bool, donation: PropTypes.object }

  render() {
    const {isEdit } = this.props;

    return (
      <fieldset>
        <legend>{ isEdit ? 'Proposition d\'heures' : '3 - Proposition d\'heures'}</legend>

        <MobileCollectAvailibityWarning />

        <FieldArray name="hourSuggestions">
          {({ fields, meta }) => (
            <>
              <div className="poll-suggestions clearfix">
                <button className="btn" onClick={(e) => { e.preventDefault(); fields.push(dateFormatHourMinut(dayjs())) }} disabled={fields.length >= POLL_SUGGESTION_MAX_SIZE}>Ajouter une nouvelle heure</button>
              </div>

              {fields.length >= POLL_SUGGESTION_MAX_SIZE ? <div className="alert info">Vous ne pouvez pas ajouter plus de {POLL_SUGGESTION_MAX_SIZE} propositions.</div> : null}
              {fields.map((name, index) => {
                const error = meta.error && meta.error[index] ? meta.error[index].error : undefined;
                return (
                  <div key={name}>
                    <div className="poll-suggestion">
                      <strong>{index + 1} : </strong>
                      <div>
                        <Field name={name}>{({ input }) => (<input {...input} type="time" />)}</Field>
                      </div>
                      {fields.length > 1 ? <button className="btn" onClick={() => fields.remove(index)}>x</button> : null}
                    </div>
                    {error ?
                      <div className="alert error">
                        {error === 'required' ? <div>L'heure n'est pas renseignée</div> : null}
                        {error === 'sameDate' ? <div>Vous avez déjà proposé cette horaire</div> : null}
                      </div> : null
                    }
                  </div>
                )
              }
              )}
            </>
          )}
        </FieldArray>
      </fieldset>
    );
  }
}