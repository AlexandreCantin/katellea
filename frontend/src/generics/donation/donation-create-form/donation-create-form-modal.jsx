
import React, { useState } from 'react';
import DonationCreateForm from './donation-create-form';
import Modal from '../../modal';

function DonationCreateFormModal() {
  const [showNewDonationModal, setShowNewDonationModal] = useState(false);

  if (!showNewDonationModal) return <button className="btn big" onClick={() => setShowNewDonationModal(true)} >Proposer un nouveau don</button>;

  return (
    <Modal title="Proposer un nouveau don" onClose={() => setShowNewDonationModal(false)}>
      <DonationCreateForm />
    </Modal>
  );
}

export default DonationCreateFormModal;