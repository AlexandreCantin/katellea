import React from 'react';

require('./sponsor-card.scss');

function SponsorCard({ user }) {

  if (!user) return;

  let establishment = user.establishment;

  return (
    <div className={establishment ? 'sponsor-card has-establishment' : 'sponsor-card'}>
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