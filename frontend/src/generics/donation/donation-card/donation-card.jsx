import React from 'react';
import { DONATION_TYPE_LABELS } from '../../../enum';
import { dateFormatShortDayDayMonthYear } from '../../../services/date-helper';

require('./donation-card.scss');

function DonationCard({ donation }) {
  if (!donation) return;

  const establishment = donation.establishment;

  return (
    <div className="donation-card">
      <h2 className="sr-only">Votre proposition de don actuelle</h2>
      <div>
        <h3>Proposition de don</h3>
        <ul>
          <li>Créé le : {dateFormatShortDayDayMonthYear(donation.createdAT)}</li>
          {establishment ? <li>{DONATION_TYPE_LABELS[donation.donationType]}</li> : null}
        </ul>
      </div>
      {establishment ?
        <div>
          <h3>Etablissement</h3>
          <div>
            <ul>
              <li>{establishment.name}</li>
              <li>{establishment.address}</li>
            </ul>
          </div>
        </div>
        : <div>
          <h4>Emplacement</h4>
          <p>{donation.mobileCollect}</p>
        </div>
      }
    </div>
  );
}

export default DonationCard;