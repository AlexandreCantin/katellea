import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from '@reach/router';

import { BetaBadge } from '../../generics/beta-badge/beta-badge';
import store from '../../services/store';
import { isEmpty, extractKey } from '../../services/helper';

require('./not-found.scss');

class NotFound extends Component {

  constructor(props) {
    super(props);

    this.state = {
      hasUser: !isEmpty(store.getState().user)
    };
  }


  render() {
    const hasUser = false;

    return (
      <div id="not-found">
        <Helmet>
          <title>Page non trouvée ! | Katellea</title>
          <meta name="robots" content="noindex,follow" />
        </Helmet>

        <main>
          <img src="/icons/404.svg" alt="" />
          <div>

            <div className="no-wrap logo">
              <img src="/katellea-logo.png" alt="K" />
              <span>atellea</span>
              <BetaBadge />
            </div>

            <p>Oups ! Nous n'avons pas trouvé votre page...</p>
            {hasUser ?
              <Link className="btn big" to="/tableau-de-bord">Retourner à votre tableau de bord</Link> : <Link className="btn big" to="/">Retourner à l'accueil du site</Link>}
          </div>
        </main>
      </div>
    );
  }
}

export default connect(state => extractKey(state, 'user'))(NotFound);