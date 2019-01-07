import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { Link } from '@reach/router';

import { AdminHeader } from '../admin-header';
import { AdminLastLogin } from './admin-last-login';

require('../admin.scss');


export default class AdminHome extends Component {

  render() {
    return (
      <div id="admin">
        <Helmet title="Administration" titleTemplate="%s | Administration - Katellea" />
        <AdminHeader />

        <section className="icons">
          <AdminLastLogin />

          <Link to="/admin/utilisateurs" className="text-center">
            <img src="/img/admin/users.svg" alt="" />
            <span>Gérer les utilisateurs</span>
          </Link>
          <Link to="/admin/statistiques" className="text-center">
            <img src="/img/admin/stats.svg" alt="" />
            <span>Statistiques</span>
          </Link>
          <Link to="/admin/etablissements" className="text-center">
            <img src="/img/donation-location/fixed-site.svg" alt="" />
            <span>Etablissements</span>
          </Link>
          <Link to="/admin/villes" className="text-center">
            <img src="/img/admin/city.svg" alt="" />
            <span>Villes</span>
          </Link>
          <Link to="/admin/logs" className="text-center">
            <img src="/img/admin/logs.svg" alt="" />
            <span>Historique des connexions admin</span>
          </Link>
        </section>
      </div>
    );
  }
}