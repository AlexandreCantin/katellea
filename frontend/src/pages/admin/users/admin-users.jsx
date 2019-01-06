import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { AdminHeader } from '../admin-header';

import Validators from '../../../services/forms/validators';
import { Form, Field } from 'react-final-form';
import { validateForm } from '../../../services/forms/validate';

import Loader from '../../../generics/loader/loader';
import Pagination from '../../../generics/pagination';
import { AdminUserService } from '../../../services/admin/admin-user.service';
import { dateFormatDayMonthYearHourMinutSecond } from '../../../services/date-helper';
import Modal from '../../../generics/modal';
import { AdminUserDetails } from './admin-user-details';

require('../admin.scss');

const PAGE_SIZE = 30;
const FORM_RULES = { term: [Validators.required(), Validators.minLength(2) ] }

export default class AdminUsers extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      users: [],
      nbTotalUsers: undefined,
      pageSize: PAGE_SIZE,
      currentPage: 0,

      searchTerm: '',

      selectedUser: undefined
    }
  }

  async componentDidMount() {
    // Get the number of users
    try {
      const nbTotalUsers = await AdminUserService.getTotalUserNumber();
      this.setState({ nbTotalUsers });
    } catch(err) {}

    // Get the users first page
    this.getUserPage();
  }

  async getUserPage() {
    try {
      const users = await AdminUserService.getAllUsers({
        page: this.state.currentPage,
        pageSize: this.state.pageSize
      });
      this.setState({ users, loading: false });
    } catch(err) {
      this.setState({ users:[], loading: false });
    }
  }

  updatePage = (pageNumber) => {
    this.setState({ currentPage: pageNumber }, () => this.getUserPage());
  }

  // USER SELECTED
  selectUser = (event) => this.setState({ selectedUser: event.target.getAttribute('data-id') });
  clearSelectedUser = () => this.setState({ selectedUser: undefined });

  // SEARCH
  searchUser = async (values) => {
    const term = values.term;
    this.setState({ searchTerm: term, currentPage: 0, users: [] });

    try {
      const users = await AdminUserService.searchUser({ term: encodeURIComponent(term) });
      this.setState({ users });
    } catch(err) {
      this.setState({ users:[] });
    }
  }
  cancelSearch = (event) => {
    event.preventDefault();
    this.setState({ searchTerm: '', currentPage: 0, users: [] }, () => this.getUserPage());
  }

  // RENDER
  render() {
    const { loading, nbTotalUsers, users, pageSize, currentPage, selectedUser, searchTerm } =  this.state;

    return (
      <div id="admin-users">
        <Helmet title="Utilisateurs" titleTemplate="%s | Administration - Katellea" />
        <AdminHeader subTitle="Gestion des utilisateurs" />


        <section className="admin-content clearfix">
          <Form
            onSubmit={this.searchUser}
            initialValues={{ term: searchTerm }}
            validate={values => validateForm(values, FORM_RULES)}
            render={({ handleSubmit, invalid }) => (
              <form className="admin-search-form" onSubmit={handleSubmit}>
                <Field name="term">
                  {({ input }) => (
                    <>
                      <label htmlFor="term" className="sr-only">Id, nom, email..."</label>
                      <input {...input} id="term" name="term" type="text" placeholder="Id, nom, email..." />
                    </>
                  )}
                </Field>

                { searchTerm ? <button onClick={this.cancelSearch}>Annuler</button> : null }
                <label htmlFor="submit-user-search" className="sr-only">Chercher</label>
                <input id="submit-user-search" type="submit" disabled={invalid} value="Chercher des utilisateurs" />
              </form>
            )} />

          { loading ? <div className="text-center"><Loader /></div> : null }
          { !loading && users.length === 0 ? <div className="alert info">Pas d'utilisateurs trouvées...</div> : null }
          { !loading && users.length > 0 ?
            <table className="text-center">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>E-mail</th>
                  <th>Créé le</th>
                  <th>En savoir plus</th>
                </tr>
              </thead>
              <tbody>
              {
                users.map(user => (
                  <tr key={user.id}>
                    <td>{ user.id }</td>
                    {/* TODO: use name in the future */}
                    <td>{ user.firstName } { user.lastName }</td>
                    <td>{ user.email }</td>
                    <td>{ dateFormatDayMonthYearHourMinutSecond(user.createdAt) }</td>
                    <td><button data-id={user.id} onClick={this.selectUser} className="btn small">Détails</button></td>
                  </tr>
                ))
              }
              </tbody>
            </table> : null
          }

          { !loading && nbTotalUsers && !searchTerm?
            <div className="fr">
              <Pagination currentPage={currentPage} pageSize={pageSize} total={nbTotalUsers} onPageChange={this.updatePage} />
            </div> : null }
        </section>

        { selectedUser ?
            <Modal title="Details de l'utilisateur" onClose={() => this.clearSelectedUser()} noModalUrl>
              <AdminUserDetails userId={selectedUser} />
            </Modal> : null }
      </div>
    );
  }
}