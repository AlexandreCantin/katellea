
import React, { useState } from 'react';
import DonationCreateForm from './donation-create-form';
import Modal from '../../modal';

function DonationCreateFormModal({ modalUrl, text, addSubtext = false }) {
  const [showNewDonationModal, setShowNewDonationModal] = useState(false);
  const buttonText = text || "Proposer un nouveau don";

  if (!showNewDonationModal) {
    return (
      <button className="btn big new-donation" onClick={() => setShowNewDonationModal(true)} >
        { buttonText }
        { addSubtext ? <span>- En 30 secondes -</span> : null }
      </button>);
  }

  return (
    <Modal title="Proposer un nouveau don" onClose={() => setShowNewDonationModal(false)} modalUrl={modalUrl}>
      <DonationCreateForm />
    </Modal>
  );
}

export default DonationCreateFormModal;