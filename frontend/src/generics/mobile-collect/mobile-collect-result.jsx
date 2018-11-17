import React from 'react';
import { dateFormatLongDayDayMonthYear, dateFormatHourMinut } from '../../services/date-helper';


function MobileCollectResult({ mobileCollect }) {
  return (
    <div className="mobile-connect-result">
      <div>
        <div>{mobileCollect.city}</div>
        <div className="location">
          {mobileCollect.place}
          <a className="native" href={mobileCollect.mapUrl} target="_blank" rel="noopener noreferrer" title="Localiser sur une carte (Ouverture dans une nouvelle fenêtre)">Voir sur une carte</a>
        </div>
        {mobileCollect.distance ? <div>À environ {mobileCollect.distance} Km</div> : null}
      </div>
      <div>
        <div>Le {dateFormatLongDayDayMonthYear(mobileCollect.start)}</div>
        <div>De {dateFormatHourMinut(mobileCollect.beginDate)} à {dateFormatHourMinut(mobileCollect.endDate)}</div>
      </div>
    </div>
  );
}

export default MobileCollectResult;