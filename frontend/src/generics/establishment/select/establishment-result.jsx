import React from 'react';


function EstablishmentResult({ establishment }) {
  return (
    <div className="establishment-result">
      <div>
        <span className="bold">Nom : </span>{establishment.name}<br />
        <span className="bold">Adresse : </span> {establishment.address}
      </div>
      <div>
        <span className="bold">À environ : </span> {establishment.distance} Km(s)
      </div>
    </div>
  );
}

export default EstablishmentResult;