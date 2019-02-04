import React from 'react';
import { Link } from '@reach/router';

import store from '../../../services/store';
import { isEmpty } from '../../../services/helper';
import DonationCreateFormModal from '../donation-create-form/donation-create-form-modal';

const NoDonationFound = () => {

  const hasUser = store.getState().user.id;

  return (
    <div className="text-center no-donation-found">
      <div className="alert error text-center">
        Aucune proposition de don trouvée.<br />Ce don est peut-être terminé ou alors son créateur l'a supprimé
      </div>

      { hasUser ?
        <Link className="btn small" to="/tableau-de-bord">Retourner à votre tableau de bord</Link> : <Link className="btn small" to="/">Retourner à l'accueil du site</Link>
      }

      <DonationCreateFormModal modalUrl="/nouveau-don" />
    </div>
  );
}


export default NoDonationFound;
