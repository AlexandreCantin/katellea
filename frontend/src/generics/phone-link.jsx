import React from 'react';

// Convert to international phone format
const formatPhone = (phone) => {
  return phone.replace('0', '+33').replace(/-/g, '');
}

function PhoneLink(props) {
  const establishment = props.establishment;
  const formattedPhone = formatPhone(establishment.phone)

  return (
    <a href={'tel:' + formattedPhone} target="_blank" rel="noopener noreferrer" title="Appeler ce numéro pour prendre rendez-vous (Appel immédiat)">
      {establishment.phone}
    </a>
  );
}

export default PhoneLink;