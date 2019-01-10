import React from 'react';
import { Link } from '@reach/router';

export const AdminHeader = ({ subTitle }) => (
  <>
    <header id="admin-header" className="text-center">
      <h1>Administration de <img src="/katellea-logo.svg" alt="K" />atellea</h1>
      <div className="links">
        <Link className="fr dashboard-return" to="/tableau-de-bord" title="Retour à Katellea">Retour à Katellea</Link>
        <Link className="fr admin-return" to="/admin" title="Retour administration">Retour à l'administration</Link>
      </div>
    </header>
    { subTitle ? <h2 className="subtitle text-center">{subTitle}</h2> : null }
  </>
);
