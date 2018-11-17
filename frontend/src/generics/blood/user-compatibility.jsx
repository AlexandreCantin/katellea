import React from 'react';

const BLOOD_COMPATIBILITY_ALT = {
  'A+': 'Vous pouvez donner du sang aux groupes : A+ et AB+; et recevoir des groupes: A+, A-, O+ et O-',
  'A-': 'Vous pouvez donner du sang aux groupes : A+, A-, AB+ et AB-; et recevoir des groupes: A- et O-',
  'B+': 'Vous pouvez donner du sang aux groupes : B+ et AB+; et recevoir des groupes: B+, B-, O+ et O-',
  'B-': 'Vous pouvez donner du sang aux groupes : B+, B-, AB+ et AB-; et recevoir des groupes: B- et O-',
  'AB+': 'Vous pouvez donner du sang du groupe AB+; et recevoir de tous les groupes',
  'AB-': 'Vous pouvez donner du sang aux groupes : AB+ et AB-; et recevoir des groupes: A-, O-, B- et AB-',
  'O+': 'Vous pouvez donner du sang aux groupes : A+, O+, B+ et AB+; et recevoir des groupes: O- et O+',
  'O-': 'Vous pouvez donner du sang aux groupes de tous les groupes et recevoir du groupe O-',
};

function UserCompatibility({ bloodType }) {

  if (!bloodType) return null;

  const alt = BLOOD_COMPATIBILITY_ALT[bloodType];

  if (bloodType === 'A+') return <img src="/img/blood-type/A+.png" alt={alt} />;
  else if (bloodType === 'A-') return <img src="/img/blood-type/A-.png" alt={alt} />;
  else if (bloodType === 'B+') return <img src="/img/blood-type/B+.png" alt={alt} />;
  else if (bloodType === 'B-') return <img src="/img/blood-type/B-.png" alt={alt} />;
  else if (bloodType === 'AB+') return <img src="/img/blood-type/AB+.png" alt={alt} />;
  else if (bloodType === 'AB-') return <img src="/img/blood-type/AB-.png" alt={alt} />;
  else if (bloodType === 'O+') return <img src="/img/blood-type/O+.png" alt={alt} />;
  else if (bloodType === 'O-') return <img src="/img/blood-type/O-.png" alt={alt} />;

  return null;
}

export default UserCompatibility;