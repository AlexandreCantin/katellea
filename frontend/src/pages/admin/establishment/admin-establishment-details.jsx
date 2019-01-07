import React, { Component } from 'react';
import Loader from '../../../generics/loader/loader';
import { AdminCityEstablishmentService } from '../../../services/admin/admin-city-establishment.service';

import Validators from '../../../services/forms/validators';
import { Form, Field } from 'react-final-form';
import { validateForm } from '../../../services/forms/validate';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';
import FlashMessage from '../../../generics/flash-message';

const FORM_RULES = {
  verified: [Validators.required()],
  internalComment: [Validators.required()]
}

export class AdminEstablishmentDetails extends Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      establishment: undefined,
      formData: {}
    }
  }

  async componentDidMount() {
    try {
      const establishment = await AdminCityEstablishmentService.getEstablishment(this.props.establishmentId)

      let formData = {
        verified: establishment.verified ? 'yes':'no',
        internalComment: establishment.internalComment
      }

      this.setState({ loading: false, establishment, formData });
    } catch(err) {
      this.setState({ loading: false });
    }
  }

  saveEstablishment = async (values) => {
    let verified = false;
    if(values.verified === 'yes') verified = true;
    else if(values.verified === 'no') verified = false;

    try {
      await AdminCityEstablishmentService.saveEstablishment({
        id: this.props.establishmentId,
        verified: verified,
        internalComment: values.internalComment
      })
      FlashMessageService.createSuccess('Etablissement mis à jour. N\'oubliez pas de réactualiser la page !', 'admin-establishment-details');
    } catch(err) {
      FlashMessageService.createError('Erreur lors de la mise à jour... Veuillez réessayer ultérieurement.', 'admin-establishment-details');
    }
  }

  render() {
    const { loading, establishment, formData } = this.state;

    if(loading) return <Loader />;
    if(!loading && !establishment) return <div className="alert danger">Erreur lors de la récupération de l'établissement.</div>;
    if(!loading) return (
      <>
        <div>
          <pre>{JSON.stringify(establishment, '', 2)}</pre>
        </div>

        <hr />

        <h2>Modifier l'établissement</h2>

        <FlashMessage scope="admin-establishment-details" />

        <Form
          onSubmit={this.saveEstablishment}
          initialValues={formData}
          validate={values => validateForm(values, FORM_RULES)}
          render={({ handleSubmit, invalid }) => (
            <form className="form" onSubmit={handleSubmit}>
              <div className="verified-form-line">
                <span>Etablissement vérifié ?</span>
                <Field name="verified" type="radio" value="yes">
                  {({ input }) => (
                    <div>
                      <input {...input} id="yes" type="radio" value="yes" />
                      <label htmlFor="yes">Oui</label>
                    </div>
                  )}
                </Field>
                <Field name="verified" type="radio" value="no">
                  {({ input }) => (
                    <div>
                      <input {...input} id="no" type="radio" value="no" />
                      <label htmlFor="no">Non</label>
                    </div>
                  )}
                </Field>
              </div>

              <Field name="internalComment" type="textarea">
                {({ input }) => (
                  <div className="form-line">
                    <label htmlFor="internalComment">Commentaire (à usage interne uniquement):</label>
                    <textarea {...input} id="internalComment" name="internalComment"></textarea>
                    <strong>N'oubliez d'ajouter la date et l'auteur du commentaire !</strong>
                  </div>
                )}
              </Field>

              <label htmlFor="update-establishment" className="sr-only">Modifier</label>
              <input id="update-establishment" type="submit" className="btn" disabled={invalid} value="Modifier" />
            </form>
          )} />
        </>
      );
  }

}
