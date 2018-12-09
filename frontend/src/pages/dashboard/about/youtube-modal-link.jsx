import React, { useState } from 'react';
import Modal from '../../../generics/modal';

export function YoutubeModalLink({ title, modalUrl, url }) {
  const [showModal, setShowModal] = useState(0);

  const renderModal = () => {
    return (
      <Modal title={title} onClose={() => setShowModal(false)} modalUrl={modalUrl}>
        <div className="youtube-video">
          <iframe sandbox="allow-scripts allow-same-origin allow-presentation" title={title} src={url + '?autoplay=1'} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen>&nbsp;</iframe>
        </div>
      </Modal>
    );
  }


  return (
    <>
      <img src="/icons/social-networks/youtube.svg" alt="Video Youtube" />
      <button className="btn reset" onClick={() => setShowModal(true)}>{title}</button>
      {showModal ? renderModal() : null}
    </>
  );

}