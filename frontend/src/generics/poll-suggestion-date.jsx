import React from 'react';
import cx from 'classnames';

import { DAY_PARTS_LABEL } from '../enum';
import { dateFormatShortDayDayMonthYear } from '../services/date-helper';
import { DonationService } from '../services/donation/donation.service';

function PollSuggestionDate({ isMultipleDay, pollSuggestion, index, nbPollSuggestions }) {

  const computeClass = (nbPollSuggestions, index) => {
    // We use this method because last-child/first-child can't be used
    return cx(
      'date',
      { 'first': index === 0 },
      { 'last': nbPollSuggestions === index + 1 },
    );
  }

  const getPartDayLabel = (dayPart) => {
    return DAY_PARTS_LABEL[dayPart];
  }

  const value = isMultipleDay ? dateFormatShortDayDayMonthYear(pollSuggestion.date) : DonationService.formatHourPollSuggestion(pollSuggestion.hour);

  return (
    <div className={computeClass(nbPollSuggestions, index)}>
      <span>{value}</span>
      <span>{getPartDayLabel(pollSuggestion.dayPart)}</span>
    </div>
  );
}


export default PollSuggestionDate;
