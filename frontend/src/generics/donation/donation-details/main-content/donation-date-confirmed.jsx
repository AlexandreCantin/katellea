import React from 'react';
import { dateFormatLongDayDayMonthYearHourMinut } from '../../../../services/date-helper';
import slugify from 'slugify';

const DonationDateConfirmed = ({ donation }) => {

  return (
    <div className="donation-confirmed-date block-base">
      <h2>Le rendez-vous a été pris !</h2>

      <div className="date alert warning text-center">
        <strong>{dateFormatLongDayDayMonthYearHourMinut(donation.finalDate)}</strong>
      </div>

      <div className="attendees">
        <h3>Personnes inscrites</h3>
        <ul>{donation.finalAttendeesUser.map(attendee => (<li key={attendee.id}>{attendee.name}</li>))}</ul>
        <ul>{donation.finalAttendeesGuest.map(attendeeName => (<li key={slugify(attendeeName)}>{attendeeName}</li>))}</ul>
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
