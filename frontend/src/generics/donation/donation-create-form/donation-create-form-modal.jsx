
import React, { useState } from 'react';
import DonationCreateForm from './donation-create-form';
import Modal from '../../modal';

function DonationCreateFormModal({ modalUrl, text }) {
  const [showNewDonationModal, setShowNewDonationModal] = useState(false);
  const buttonText = text || "Proposer un nouveau don";

  if (!showNewDonationModal) return <button className="btn big" onClick={() => setShowNewDonationModal(true)} >{ buttonText }</button>;

  return (
    <Modal title="Proposer un nouveau don" onClose={() => setShowNewDonationModal(false)} modalUrl={modalUrl}>
      <DonationCreateForm />
    </Modal>
  );
}

export default DonationCreateFormModal;