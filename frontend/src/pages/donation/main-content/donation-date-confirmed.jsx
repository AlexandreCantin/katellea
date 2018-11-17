import React from 'react';
import { UserService } from '../../../services/user/user.service';
import { dateFormatLongDayDayMonthYearHourMinutSecond } from '../../../services/date-helper';

const DonationDateConfirmed = (props) => {
  const { donation } = props;

  return (
    <div className="donation-confirmed-date block-base">
      <h2>Le rendez-vous a été pris !</h2>

      <div className="date alert warning text-center">
        <strong>{dateFormatLongDayDayMonthYearHourMinutSecond(donation.finalDate)}</strong>
      </div>

      <div className="attendees">
        <h3>Personnes inscrites</h3>
        <ul>{donation.finalAttendees.map(attendee => (<li>{UserService.getFullName(attendee)}</li>))}</ul>
      </div>

      <div className="selfie alert info">
        <img src="/icons/selfie.svg" alt="" />
        <div className="text-center">
          N'hésitez pas à prendre des photos/selfies de votre don et à les partager sur les réseaux sociaux.<br />
          Il n'y a pas de honte à partager votre geste. Au contraire, cela peut inspirer d'autres personnes à en faire aussi !<br />
          <ul className="hashtags inline-list unstyled-list">
            <li>#DonDeSang</li>
            <li>#Partagezvotrepouvoir</li>
            <li>@EFS_dondesang</li>
            <li>@Katellea_officiel</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DonationDateConfirmed;
