import React from 'react';
import dayjs from 'dayjs';

const DonationEventDate = (props) => {
  const { date } = props;
  return (<span>{dayjs(date).fromNow()}</span>);
}

export default DonationEventDate;
