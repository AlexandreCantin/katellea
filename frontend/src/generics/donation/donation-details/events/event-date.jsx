import React from 'react';
import dayjs from 'dayjs';

const DonationEventDate = ({ date }) => {
  return <span>{dayjs(date).fromNow()}</span>;
}

export default DonationEventDate;
