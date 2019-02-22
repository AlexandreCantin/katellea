import React from 'react';

export const AvailibityWarning = () => {
  return (
    <div className="alert warning text-center">
      <strong>Important !</strong> Ces dates ne garantissent pas une disponibilité de l'EFS pour ces créneaux.<br />
      Afin d'améliorer vos chances, nous vous conseillons de prendre rendez-vous à minima deux semaines avant la date voulue.
    </div>
  );
}

export const MobileCollectAvailibityWarning = () => {
  return (
    <div className="alert warning text-center">
      <strong>Important !</strong> Les collectes mobiles ne proposant pas de réservations, un délai d'attente est possible.<br />
      Afin d'améliorer vos chances, nous vous conseillons d'éviter les horaires trop proche de la fermeture de la collecte.
    </div>
  );
}