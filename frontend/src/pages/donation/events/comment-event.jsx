import React, { Component } from 'react';

import DonationEventDate from './event-date';
import { DonationService } from '../../../services/donation/donation.service';
import { isEnter } from '../../../services/helper';
import store from '../../../services/store';

import { validateForm } from '../../../services/forms/validate';
import Validators from '../../../services/forms/validators';
import { Form, Field } from 'react-final-form';

const FORM_RULES = {
  comment: [Validators.required()]
}

// UseHooks here !
export default class DonationEventComment extends Component {

  constructor(props) {
    super(props);

    const user = store.getState().user;
    const isEditable = this.props.event.author.id === user.id;

    this.formData = {
      'id': this.props.event._id,
      'comment': this.props.event.comment,
    }

    this.state = {
      isEditable,
      isEditing: false,
    };
  }

  showEditForm = () => { this.setState({ isEditing: true }); }
  hideEditForm = () => { this.setState({ isEditing: false }); }

  updateComment = (values) => {
    DonationService.saveComment(this.props.donation, values)
      .then(() => this.setState({ isEditing: false }));
  }


  renderForm() {

    return (
      <Form
        onSubmit={this.updateComment}
        initialValues={this.formData}
        validate={values => validateForm(values, FORM_RULES)}
        render={({ handleSubmit, invalid }) => (
          <div className="event donation-comment has-form">
            <form className="form" onSubmit={handleSubmit}>
              <Field name="id">{({ input }) => (<input {...input} type="hidden" />)}</Field>
              <Field name="comment">
                {({ input }) => (
                  <textarea {...input} id="comment" name="comment" onKeyPress={(e) => isEnter(e) ? handleSubmit() : null}></textarea>
                )}
              </Field>

              <button className="cancel btn" onClick={this.hideEditForm}>Annuler</button>
              <input type="submit" className="btn fr" disabled={invalid} value="Modifier" />
            </form>
          </div>
        )} />
    );
  }

  renderComment() {
    const event = this.props.event;
    const author = event.author;

    let updated = false;
    if (event.data) updated = event.data.updated || false;

    return (
      <div className="event donation-comment">
        <p>
          {event.comment}
          {updated ? <em>(modifié)</em> : null}
          {this.state.isEditable ? <button className="edit btn" onClick={this.showEditForm}>Modifier</button> : null}
        </p>
        <p className="comment-date">par {author.name}, <DonationEventDate date={event.date} /></p>
      </div>
    );
  }
  render() {
    const { isEditing } = this.state;

    if (isEditing) return this.renderForm();
    return this.renderComment();
  }
}