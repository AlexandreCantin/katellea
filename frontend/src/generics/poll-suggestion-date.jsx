import React from 'react';
import { DAY_PARTS_LABEL } from '../enum';
import { dateFormatShortDayDayMonthYear } from '../services/date-helper';
import { DonationService } from '../services/donation/donation.service';

function PollSuggestionDate({ isEstablishmentDonation, pollSuggestion, index, nbPollSuggestions }) {

  const computeClass = (nbPollSuggestions, index) => {
    // We use this method because last-child/first-child can't be used
    let base = 'date';
    if (index === 0) base = base.concat(' first');
    if (nbPollSuggestions === index + 1) base = base.concat(' last');
    return base;
  }

  const getPartDayLabel = (dayPart) => {
    return DAY_PARTS_LABEL[dayPart];
  }

  const value = isEstablishmentDonation ? dateFormatShortDayDayMonthYear(pollSuggestion.date) : DonationService.formatHourPollSuggestion(pollSuggestion.hour);

  return (
    <div className={computeClass(nbPollSuggestions, index)}>
      <span>{value}</span>
      <span>{getPartDayLabel(pollSuggestion.dayPart)}</span>
    </div>
  );
}


export default PollSuggestionDate;
