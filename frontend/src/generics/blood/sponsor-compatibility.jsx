import React from 'react';

const DIRECTION = {
  BOTH: { img: 'both.png', alt: 'Vous pouvez à la fois donner et recevoir du sang de votre parrain. Cool !' },
  LEFT: { img: 'left.png', alt: 'Vous pouvez recevoir du sang de votre parrain mais pas inversement.' },
  RIGHT: { img: 'right.png', alt: 'Vous pouvez donner votre sang à votre parrain mais pas inversement.' },
  NO: { img: 'no.png', alt: 'Votre groupe sanguin n\'est pas compatible avec celui de votre parrain. Dommage !' },
};

const BLOOD_COMPATIBILITY = {
  'A+': {
    'A+': DIRECTION.BOTH,
    'A-': DIRECTION.LEFT,
    'B+': DIRECTION.NO,
    'B-': DIRECTION.NO,
    'AB+': DIRECTION.RIGHT,
    'AB-': DIRECTION.NO,
    'O+': DIRECTION.LEFT,
    'O-': DIRECTION.LEFT,
  },
  'A-': {
    'A+': DIRECTION.RIGHT,
    'A-': DIRECTION.BOTH,
    'B+': DIRECTION.NO,
    'B-': DIRECTION.NO,
    'AB+': DIRECTION.RIGHT,
    'AB-': DIRECTION.RIGHT,
    'O+': DIRECTION.NO,
    'O-': DIRECTION.LEFT,
  },
  'B+': {
    'A+': DIRECTION.NO,
    'A-': DIRECTION.NO,
    'B+': DIRECTION.BOTH,
    'B-': DIRECTION.LEFT,
    'AB+': DIRECTION.RIGHT,
    'AB-': DIRECTION.NO,
    'O+': DIRECTION.LEFT,
    'O-': DIRECTION.LEFT,
  },
  'B-': {
    'A+': DIRECTION.NO,
    'A-': DIRECTION.NO,
    'B+': DIRECTION.RIGHT,
    'B-': DIRECTION.BOTH,
    'AB+': DIRECTION.RIGHT,
    'AB-': DIRECTION.RIGHT,
    'O+': DIRECTION.NO,
    'O-': DIRECTION.LEFT,
  },
  'AB+': {
    'A+': DIRECTION.LEFT,
    'A-': DIRECTION.LEFT,
    'B+': DIRECTION.LEFT,
    'B-': DIRECTION.LEFT,
    'AB+': DIRECTION.BOTH,
    'AB-': DIRECTION.LEFT,
    'O+': DIRECTION.LEFT,
    'O-': DIRECTION.LEFT,
  },
  'AB-': {
    'A+': DIRECTION.NO,
    'A-': DIRECTION.LEFT,
    'B+': DIRECTION.NO,
    'B-': DIRECTION.LEFT,
    'AB+': DIRECTION.RIGHT,
    'AB-': DIRECTION.BOTH,
    'O+': DIRECTION.NO,
    'O-': DIRECTION.LEFT,
  },
  'O+': {
    'A+': DIRECTION.RIGHT,
    'A-': DIRECTION.NO,
    'B+': DIRECTION.RIGHT,
    'B-': DIRECTION.NO,
    'AB+': DIRECTION.RIGHT,
    'AB-': DIRECTION.NO,
    'O+': DIRECTION.BOTH,
    'O-': DIRECTION.LEFT,
  },
  'O-': {
    'A+': DIRECTION.RIGHT,
    'A-': DIRECTION.RIGHT,
    'B+': DIRECTION.RIGHT,
    'B-': DIRECTION.RIGHT,
    'AB+': DIRECTION.RIGHT,
    'AB-': DIRECTION.RIGHT,
    'O+': DIRECTION.RIGHT,
    'O-': DIRECTION.BOTH,
  },
};

function SponsorCompatibility({ sponsorBloodType, userBloodType }) {

  if (sponsorBloodType === 'unknown' && userBloodType === 'unknown') return null;
  let direction = BLOOD_COMPATIBILITY[sponsorBloodType][userBloodType];
  if (!direction) return null;

  return (<img className="img-responsive" src={'/img/sponsor-compatibility/' + direction.img} alt={direction.alt} />);
}

export default SponsorCompatibility;