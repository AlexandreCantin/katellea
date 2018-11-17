import React from 'react';

const CurrentStep = (props) => {

  const { donation } = props;

  let step4Done = donation.isDone();
  let step3Done = donation.isScheduled() || step4Done;
  let step2Done = donation.isPollEnded() || step3Done;

  return (
    <div id="current-step">
      <div className="step1 done">
        1
          <div className="popover">Sondage en cours</div>
      </div>
      <hr className={step2Done ? 'done' : ''} />
      <div className={step2Done ? 'done' : ''}>
        2
          <div className="popover">Rendez-vous à prendre</div>
      </div>
      <hr className={step3Done ? 'done' : ''} />
      <div className={step3Done ? 'done' : ''}>
        3
          <div className="popover">Aller au rendez-vous</div>
      </div>
      <hr className={step4Done ? 'done' : ''} />
      <div className={step4Done ? 'done' : ''}>
        4
          <div className="popover">Don effectué !</div>
      </div>
    </div>
  );
}

export default CurrentStep;