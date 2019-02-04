import React, { Component } from 'react';
import PropTypes from 'prop-types';

import DonationEventDate from './event-date';
import { DonationService } from '../../../../services/donation/donation.service';
import { isEnter } from '../../../../services/helper';
import store from '../../../../services/store';

import { validateForm } from '../../../../services/forms/validate';
import Validators from '../../../../services/forms/validators';
import { Form, Field } from 'react-final-form';

const FORM_RULES = {
  commentId: [Validators.required()],
  comment: [Validators.required()]
}

// UseHooks here !
export default class DonationEventComment extends Component {
  static propTypes = {
    donation: PropTypes.object.isRequired,
    event: PropTypes.object.isRequired
  }


  constructor(props) {
    super(props);

    const user = store.getState().user;
    const isEditable = !user.id || !this.props.event.author ? false : this.props.event.author.id === user.id;

    this.formData = {};

    this.state = {
      isEditable,
      isEditing: false,
    };
  }

  computeFormData() {
    this.formData = {
      'commentId': this.props.event._id,
      'comment': this.props.event.comment,
    }
  }

  showEditForm = () => {
    this.computeFormData(); // Get last comment values (useful in case of multiple comment updates)
    this.setState({ isEditing: true });
  }
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
              <Field name="commentId">{({ input }) => (<input {...input} type="hidden" readOnly />)}</Field>
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
    const name = event.username || event.author.name;

    let updated = false;
    if (event.data) updated = event.data.updated || false;

    return (
      <div className="event donation-comment">
        <p>
          {event.comment}
          {updated ? <em>(modifié)</em> : null}
          {this.state.isEditable ? <button className="edit btn" onClick={this.showEditForm}>Modifier</button> : null}
        </p>
        <p className="comment-date">par {name}, <DonationEventDate date={event.date} /></p>
      </div>
    );
  }
  render() {
    const { isEditing } = this.state;

    if (isEditing) return this.renderForm();
    return this.renderComment();
  }
}