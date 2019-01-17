import React, { useState } from 'react';
import Modal from '../../../generics/modal';
import { RGPDService } from '../../../services/rgpd.service';

export function YoutubeModalLink({ title, modalUrl, url }) {
  const [showModal, setShowModal] = useState(0);

  const acceptRGPDYoutube = () => {
    RGPDService.updateRGPDConsent({ otherServices: true });
    setShowModal(true); // Ugly forceUpdate
  }

  const renderModal = () => {
    const hasAcceptedRGPDYoutube = RGPDService.getRGPDValue('otherServices');

    if(!hasAcceptedRGPDYoutube) {
      return (
        <Modal title={title} onClose={() => setShowModal(false)} modalUrl={modalUrl}>
          <div className="youtube-video">
            <div className="alert info text-center">Vous n'avez pas accepté les conditions d'utilisation de Youtube.</div>
            <div className="buttons text-center">
              <button className="btn big"onClick={() => acceptRGPDYoutube()}>Accepter et visionner la vidéo</button>
              <button className="btn danger"onClick={() => setShowModal(false)}>Refuser et fermer la fenêtre</button>
            </div>
          </div>
        </Modal>
      );
    }

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