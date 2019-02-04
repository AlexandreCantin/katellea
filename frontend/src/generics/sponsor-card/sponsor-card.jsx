import React from 'react';
import cx from 'classnames';

require('./sponsor-card.scss');

function SponsorCard({ user }) {

  if (!user) return;

  let establishment = user.establishment;

  return (
    <div className={cx('sponsor-card', { 'has-establishment' : establishment })}>
      <div>
        <h4>Votre parrain/marraine : {user.name}</h4>
        <ul>
          <li>Groupe sanguin : {user.bloodTypeToString()}</li>
        </ul>
      </div>
      {establishment ?
        <div>
          <h4>Etablissement</h4>
          <div>
            <ul>
              <li>{establishment.name}</li>
              <li>{establishment.address}</li>
            </ul>
          </div>
        </div>
        : null}
    </div>
  );
}

export default SponsorCard;