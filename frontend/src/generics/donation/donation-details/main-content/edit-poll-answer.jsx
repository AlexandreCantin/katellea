import React, { useState } from 'react';
import { Form, Field } from 'react-final-form';

import Validators from '../../../../services/forms/validators';
import { POLL_ANSWERS } from '../../../../enum';
import { validateForm } from '../../../../services/forms/validate';

import Modal from '../../../modal';
import PollDates from './poll-dates';
import { DonationService } from '../../../../services/donation/donation.service';
import { FlashMessageService } from '../../../../services/flash-message/flash-message.service';
import FlashMessage from '../../../flash-message';

const EditPollAnswer = ({ donation, pollAnswer }) => {
  const [showModal, setShowModal] = useState(false);

  // Genrate initial form poll answers
  const pollAnswerInitialValues = {id: pollAnswer._id }
  const formRules = {};
  pollAnswer.answers.forEach((pa, index) => {
    const name = ''.concat(index, '-suggestion');
    formRules[name] = [Validators.required()]
    pollAnswerInitialValues[name] = pa;
  });

  if (!showModal) return (
    <button onClick={() => setShowModal(true)} className="btn reset">
      <img src="/icons/edit.svg" title="Editer la réponse" alt="" />
    </button>
  );

  function updatePollAnswer(values) {
    // Remove id
    const valuesWithoutId = Object.assign({}, values);
    delete valuesWithoutId['id'];
    const data = { answers: Object.values(valuesWithoutId), id: values.id, username: pollAnswer.username };

    DonationService.savePollAnswer(donation, data, false)
      .then(() => {
        FlashMessageService.createSuccess('Vos choix ont été pris en compte.', 'donation');
        setTimeout(() => setShowModal(false), 500)
      })
      .catch(() => FlashMessageService.createError('Erreur lors de la sauvegarde de vos réponses. Veuillez réessayer ultérieurement', 'edit-poll-answer'));
  }

  return (
    <Modal title={"Modifier les réponses au sondage " + pollAnswer.username} onClose={() => setShowModal(false)} modalUrl="/donation/modifier-reponse-sondage" cssClass="edit-donation-answer">
      <FlashMessage scope="edit-poll-answer" />
      <div className={`poll-table ${donation.pollSuggestions.length}-size`}>

        <PollDates donation={donation} removeTrimDiv />

        <Form
          onSubmit={updatePollAnswer}
          initialValues={pollAnswerInitialValues}
          validate={values => validateForm(values, formRules)}
          render={({ handleSubmit, invalid }) => (
            <form onSubmit={handleSubmit} className="poll-form text-center">
              <div>
                {
                  donation.pollSuggestions.map((ps, index) => {

                    let yesLabel = ''.concat('edit-yes-', index);
                    let noLabel = ''.concat('edit-no-', index);
                    let maybeLabel = ''.concat('edit-maybe-', index);
                    let name = ''.concat(index, '-suggestion');

                    let cssClass = 'poll-answer-choices';
                    if (index === donation.pollSuggestions.length - 1) cssClass = cssClass.concat(' last');

                    return (
                      <div key={index} className={cssClass}>

                        <Field name={name} type="radio" value={POLL_ANSWERS.YES}>
                          {({ input }) => (
                            <div>
                              <input {...input} id={yesLabel} name={name} type="radio" value={POLL_ANSWERS.YES} />
                              <label htmlFor={yesLabel}>Oui</label>
                            </div>
                          )}
                        </Field>

                        <Field name={name} type="radio" value={POLL_ANSWERS.NO}>
                          {({ input }) => (
                            <div>
                              <input {...input} id={noLabel} name={name} type="radio" value={POLL_ANSWERS.NO} />
                              <label htmlFor={noLabel}>Non</label>
                            </div>
                          )}
                        </Field>

                        <Field name={name} type="radio" value={POLL_ANSWERS.MAYBE}>
                          {({ input }) => (
                            <div>
                              <input {...input} id={maybeLabel} name={name} type="radio" value={POLL_ANSWERS.MAYBE} />
                              <label htmlFor={maybeLabel}>Peut-être</label>
                            </div>
                          )}
                        </Field>
                      </div>
                    );
                  })
                }
              </div>

              <div className="button-container text-center">
                <Field name="id">{({ input }) => (<input {...input} type="hidden" readOnly />)}</Field>
                <input className="btn big" type="submit" value='Modifier les réponses' disabled={invalid} />
              </div>
            </form>
          )} />
      </div>
    </Modal>
  );

}

export default EditPollAnswer;