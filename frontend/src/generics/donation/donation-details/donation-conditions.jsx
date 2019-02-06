import React, { useState } from 'react';
import Modal from '../../modal';
import AboutContainer from '../../../pages/dashboard/about/about-container';

const DonationConditions = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="conditions">
        <button onClick={() => setShowModal(true)} className="fr btn">En savoir plus sur le don du sang</button>
      </div>
      { showModal ?
        <Modal title="À propos du don du sang" onClose={() => setShowModal(false)} modalUrl="/donation/conditions">
          <AboutContainer inModal />
        </Modal> : null }
    </>
  )
}

export default DonationConditions;