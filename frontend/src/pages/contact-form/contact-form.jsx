import React, { Component } from 'react';
import Helmet from 'react-helmet';

import HeaderHome from '../../generics/header/home/header-home';
import HeaderUser from '../../generics/header/user/header-user';

import Menu from '../../generics/menu/menu';
import Validators from '../../services/forms/validators';
import { isEmpty } from '../../services/helper';
import store from '../../services/store';
import { ContactService } from '../../services/contact.service';
import { FlashMessageService } from '../../services/flash-message/flash-message.service';
import FlashMessage from '../../generics/flash-message';
import Breadcrumb from '../../generics/breadcrumb/breadcrumb';
import EscapeLinks from '../../generics/escape-links/escape-links';
import { Form, Field } from 'react-final-form';
import { validateForm } from '../../services/forms/validate';

require('./contact-form.scss');

const FORM_RULES = {
  fullName: [Validators.required(), Validators.minLength(3), Validators.maxLength(150)],
  email: [Validators.email(), Validators.required(), Validators.maxLength(150)],
  subject: [Validators.required(), Validators.maxLength(150)],
  message: [Validators.required(), Validators.maxLength(3000)]
}

export default class ContactForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      hasUser: !isEmpty(store.getState().user)
    };
  }


  sendForm = (values) => {
    ContactService.send(values)
      .then(() => FlashMessageService.createSuccess('Nous avons bien reçu votre message. Nous essaierons de vous répondre le plus rapidement possible.', 'contact-form'))
      .catch(() => FlashMessageService.createError('Erreur lors de l\'envoi. Veuillez réessayer ultérieurement.', 'contact-form'));
  }


  render() {
    const { hasUser } = this.state;

    let escapeLinks = [];
    escapeLinks.push({ href: '#header', text: 'En-tête de la page' });
    if (hasUser) escapeLinks.push({ href: '#menu', text: 'Menu' });
    escapeLinks.push({ href: '#main-content', text: 'Contenu principal' });

    return (
      <div className={`page text-only ${hasUser ? 'has-menu' : ''}`}>
        <Helmet title="Nous contacter" titleTemplate="%s | Katellea" />

        <EscapeLinks links={escapeLinks} />

        <div id="header" className="sr-only">&nbsp;</div>
        {hasUser ? <HeaderUser /> : <HeaderHome />}

        <Breadcrumb links={[{ href: '/nous-contacter', text: 'Nous contacter' }]} />

        <main id="contact-form">
          {hasUser ? <div id="menu" className="sr-only">&nbsp;</div> : null}
          {hasUser ? <Menu /> : null}

          <div id="main-content">
            <div className="big-title no-wrap text-center">
              <img src="/katellea-logo.png" alt="K" />
              <span>atellea</span>
            </div>

            <h1>Nous contacter</h1>

            <FlashMessage scope="contact-form" />

            <Form
              onSubmit={this.sendForm}
              validate={values => validateForm(values, FORM_RULES)}
              render={({ handleSubmit, invalid }) => (
                <form className="form" onSubmit={handleSubmit}>

                  <Field name="fullName">
                    {({ input, meta }) => (
                      <div className="form-line clearfix">
                        <label htmlFor="full-name">Prénom & Nom *</label>
                        <input {...input} id="full-name" type="text" name="fullName" maxLength="150" />

                        {meta.error && meta.touched ?
                          <div className="alert error">
                            {meta.error === 'required' ? <div>Le champ 'Prénom & Nom' est obligatoire. Veuillez renseigner ce champs.</div> : null}
                            {meta.error === 'minLength' ? <div>Le champ 'Prénom & Nom' doit comporter minimum 3 caractères.</div> : null}
                            {meta.error === 'maxLength' ? <div>Le champ 'Prénom & Nom' ne doit pas dépasser 150 caractères.</div> : null}
                          </div> : null}
                      </div>
                    )}
                  </Field>

                  <Field name="email">
                    {({ input, meta }) => (
                      <div className="form-line clearfix">
                        <label htmlFor="email">E-mail <span>*</span></label>
                        <input {...input} id="email" type="email" name="email" />
                        {meta.error && meta.touched ?
                          <div className="alert error">
                            {meta.error === 'required' ? <div>Le champ 'E-mail' est obligatoire. Veuillez renseigner ce champs.</div> : null}
                            {meta.error === 'email' ? <div>L'email n'est pas un e-mail valide. Exemple : example@mail.com</div> : null}
                          </div> : null}
                      </div>
                    )}
                  </Field>

                  <Field name="subject">
                    {({ input, meta }) => (
                      <div className="form-line clearfix">
                        <label htmlFor="subject">Sujet *</label>
                        <input {...input} id="subject" type="text" name="subject" maxLength="150" />

                        {meta.error && meta.touched ?
                          <div className="alert error">
                            {meta.error === 'required' ? <div>Le champ 'Sujet' est obligatoire. Veuillez renseigner ce champs.</div> : null}
                            {meta.error === 'minLength' ? <div>Le champ 'Sujet' doit comporter minimum 3 caractères.</div> : null}
                            {meta.error === 'maxLength' ? <div>Le champ 'Sujet' ne doit pas dépasser 150 caractères.</div> : null}
                          </div> : null}
                      </div>
                    )}
                  </Field>

                  <Field name="message" type="textarea">
                    {({ input, meta }) => (

                      <div className="form-line">
                        <label htmlFor="message">Votre message :</label>
                        <textarea {...input} id="message" name="message" maxLength="3000"></textarea>
                        <p>3000 caractères maximum</p>

                        {meta.error && meta.touched ?
                          <div className="alert error">
                            {meta.required ? <div>Le champ 'Message' est obligatoire. Veuillez renseigner ce champs.</div> : null}
                            {meta.maxLength ? <div>Le champ 'Message' ne doit pas dépasser 3000 caractères.</div> : null}
                          </div> : null
                        }
                      </div>
                    )}
                  </Field>

                  <div className="submit-zone text-center">
                    <label htmlFor="submit" className="sr-only">Nous contacter</label>
                    <input id="submit" type="submit" className="btn big" value="Nous contacter" disabled={invalid} />
                  </div>
                </form>
              )}
            />

            {/*<form className="form" onSubmit={this.sendForm}>

  

              <div className="form-line clearfix">
                <label htmlFor="email">E-mail *</label>
                <input id="email" type="email" name="email"  maxLength="150" />

                {contactForm.hasErrors('email') && contactForm.isTouched('email') ?
                  <div className="alert error">
                    {contactForm.hasError('email', 'required') ? <div>Le champ 'E-mail' est obligatoire. Veuillez renseigner ce champ.</div> : null}
                    {contactForm.hasError('email', 'email') ? <div>L'email n'est pas un e-mail valide. Exemple : example@mail.com</div> : null}
                  </div> : null
                }
              </div>

              <div className="form-line clearfix">
                <label htmlFor="subject">Sujet *</label>
                <input id="subject" type="text" name="subject"  maxLength="150" />

                {contactForm.hasErrors('subject') && contactForm.isTouched('subject') ?
                  <div className="alert error">
                    {contactForm.hasError('subject', 'required') ? <div>Le champ 'Sujet' est obligatoire. Veuillez renseigner ce champs.</div> : null}
                    {contactForm.hasError('subject', 'minLength') ? <div>Le champ 'Sujet' doit comporter minimum 3 caractères.</div> : null}
                    {contactForm.hasError('subject', 'maxLength') ? <div>Le champ 'Sujet' ne doit pas dépasser 150 caractères.</div> : null}
                  </div> : null
                }
              </div>

              <div className="form-line">
                <label htmlFor="message">Votre message :</label>
                <textarea id="message"  name="message" maxLength="3000"></textarea>
                <p>3000 caractères maximum</p>

                {contactForm.hasErrors('message') && contactForm.isTouched('message') ?
                  <div className="alert error">
                    {contactForm.hasError('message', 'required') ? <div>Le champ 'Message' est obligatoire. Veuillez renseigner ce champs.</div> : null}
                    {contactForm.hasError('message', 'maxLength') ? <div>Le champ 'Message' ne doit pas dépasser 3000 caractères.</div> : null}
                  </div> : null
                }
              </div>

              
              </form>*/}

          </div>
        </main>
      </div>
    );
  }
}
