import React from 'react';
import DonationEventDate from './event-date';
import { dateFormatShortDayDayMonthYear } from '../../../services/date-helper';

const DonationEventDefinitiveDate = (props) => {
  const { event } = props;

  return (
    <div className="event donation-comment-create">
      <p>
        Rendez-vous pris le {dateFormatShortDayDayMonthYear(event.data.date)}, <DonationEventDate date={event.date} />
      </p>
    </div>
  );
}


export default DonationEventDefinitiveDate;
