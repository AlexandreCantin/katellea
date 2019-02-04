import React from 'react';

const MOBILE_LABELS = [
  'Sondage en cours',
  'Indiquer l\'horaire définitive',
  'Se rendre à la collecte',
  'Don effectué !'
];

const ESTABLISHMENT_LABELS = [
  'Sondage en cours',
  'Rendez-vous à prendre',
  'Aller au rendez-vous',
  'Don effectué !'
];


const CurrentStep = ({ donation, isMobile } ) => {
  const labels = isMobile ? MOBILE_LABELS : ESTABLISHMENT_LABELS;

  let step4Done = donation.isDone();
  let step3Done = donation.isScheduled() || step4Done;
  let step2Done = donation.isPollEnded() || step3Done;

  return (
    <div id="current-step">
      <div className="step1 done">
        1
        <div className="popover">{labels[0]}</div>
      </div>
      <hr className={step2Done ? 'done' : ''} />
      <div className={step2Done ? 'done' : ''}>
        2
        <div className="popover">{labels[1]}</div>
      </div>
      <hr className={step3Done ? 'done' : ''} />
      <div className={step3Done ? 'done' : ''}>
        3
        <div className="popover">{labels[2]}</div>
      </div>
      <hr className={step4Done ? 'done' : ''} />
      <div className={step4Done ? 'done' : ''}>
        4
        <div className="popover">{labels[3]}</div>
      </div>
    </div>
  );
}

export default CurrentStep;