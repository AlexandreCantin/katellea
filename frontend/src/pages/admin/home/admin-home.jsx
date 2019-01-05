import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { Link } from '@reach/router';
import { AdminHeader } from '../admin-header';

require('../admin.scss');


export default class AdminHome extends Component {

  render() {
    return (
      <div id="admin">
        <Helmet title="Administration" titleTemplate="%s | Administration - Katellea" />
        <AdminHeader />

        <section className="icons">
          <Link to="/admin/utilisateurs" className="text-center">
            <img src="/img/admin/users.svg" alt="" />
            <span>Gérer les utilisateurs</span>
          </Link>
          <Link to="/admin/statistiques" className="text-center">
            <img src="/img/admin/stats.svg" alt="" />
            <span>Statistiques</span>
          </Link>
        </section>
      </div>
    );
  }
}