import React from 'react';
import { dateFormatLongDayDayMonthYear, dateFormatHourMinut } from '../../services/date-helper';


function MobileCollectResult({ mobileCollect }) {

  function renderMultipleDay(mobileCollect) {
    return (
      <div>
        <div>Du {dateFormatLongDayDayMonthYear(mobileCollect.beginDate)} au {dateFormatLongDayDayMonthYear(mobileCollect.endDate)}</div>
        <div>Horaire: {dateFormatHourMinut(mobileCollect.beginDate)} - {dateFormatHourMinut(mobileCollect.endDate)}</div>
      </div>
    )
  }

  function renderOnlyDay(start) {
    return (
      <div>
        <div>Le {dateFormatLongDayDayMonthYear(start)}</div>
        <div>De {dateFormatHourMinut(mobileCollect.beginDate)} à {dateFormatHourMinut(mobileCollect.endDate)}</div>
      </div>
    )
  }

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
      { mobileCollect.multipleDay ? renderMultipleDay(mobileCollect) : renderOnlyDay(mobileCollect.start) }
    </div>
  );
}

export default MobileCollectResult;