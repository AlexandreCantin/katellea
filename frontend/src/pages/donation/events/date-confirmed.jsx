import React from 'react';
import DonationEventDate from './event-date';
import { dateFormatLongDayDayMonthYearHourMinut } from '../../../services/date-helper';

const DonationEventDefinitiveDate = (props) => {
  const { event } = props;

  return (
    <div className="event donation-comment-create">
      <p>
        Rendez-vous pris pour le <strong>{dateFormatLongDayDayMonthYearHourMinut(event.data.date)}</strong>, <DonationEventDate date={event.date} />
      </p>
    </div>
  );
}


export default DonationEventDefinitiveDate;
