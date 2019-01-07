import React, { Component } from 'react';
import { Form, Field } from 'react-final-form';
import { validateForm } from '../../services/forms/validate';
import Validators from '../../services/forms/validators';

const FORM_RULES = { term: [Validators.required(), Validators.minLength(2) ] }

export class AdminSearch extends Component {

  submitForm = (values) => this.props.submitFn(values.term);
  cancelSearch = () => this.props.cancelFn();

  render() {
    const { term, label, submitText } = this.props;

    return (
      <Form
        onSubmit={this.submitForm}
        initialValues={{ term }}
        validate={values => validateForm(values, FORM_RULES)}
        render={({ handleSubmit, invalid }) => (
          <form className="admin-search-form" onSubmit={handleSubmit}>
            <Field name="term">
              {({ input }) => (
                <>
                  <label htmlFor="term" className="sr-only">{label}</label>
                  <input {...input} id="term" name="term" type="text" placeholder={label} />
                </>
              )}
            </Field>

            { term ? <button onClick={this.cancelSearch}>Annuler</button> : null }
            <label htmlFor="submit-search" className="sr-only">Chercher</label>
            <input id="submit-search" type="submit" disabled={invalid} value={submitText} />
          </form>
      )} />
    );
  }
}

