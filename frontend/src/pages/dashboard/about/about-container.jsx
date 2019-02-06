import React from 'react';
import { YoutubeModalLink } from './youtube-modal-link';
import PDFLink from './pdf-link';

const IMPORTANCE_VIDEOS = [
  { title: 'A quoi sert le don de sang ?', url: 'https://www.youtube.com/embed/wItcrXinbqc', modalUrl: '/tableau-de-bord/videos/a-quoi-sert-le-don-du-sang' },
  { title: 'Pourquoi donner son sang ?', url: 'https://www.youtube.com/embed/x68KPoa6dtw', modalUrl: '/tableau-de-bord/videos/pourquoi-donner-son-sang' },
  { title: 'Les besoins en produits sanguins', url: 'https://www.youtube.com/embed/Iag8xEjd5LM', modalUrl: '/tableau-de-bord/videos/besoin-produits-sanguins' },
  { title: 'Le don de sang en chiffres', url: 'https://www.youtube.com/embed/ez9woyulyUA', modalUrl: '/tableau-de-bord/videos/don-du-sang-en-chiffre' }
];

const DONATION_VIDEOS = [
  { title: 'Les étapes du don', url: 'https://www.youtube.com/embed/_ai4sRE5PqU', modalUrl: '/tableau-de-bord/videos/etapes-du-don' },
  { title: 'Le parcours de la poche de sang', url: 'https://www.youtube.com/embed/HBaWyvQs870', modalUrl: '/tableau-de-bord/videos/parcours-poche-de-sang' },
];

const MORE_VIDEOS = [
  { title: 'Les étapes du don', url: 'https://www.youtube.com/embed/_ai4sRE5PqU', modalUrl: '/tableau-de-bord/videos/etapes-du-don' }
];

const AboutContainer = ({ inModal = false }) => {
  return (
    <div id="about" className="block-base">
      { !inModal ? <h2>À propos du don du sang</h2> : null }
      <h3>Son importance</h3>
      <ul className="list-unstyled">{IMPORTANCE_VIDEOS.map(video => <li key={video.url}><YoutubeModalLink {...video} /></li>)}</ul>

      <h3>Le don</h3>
      <ul className="list-unstyled">
        {DONATION_VIDEOS.map(video => <li key={video.url}><YoutubeModalLink {...video} /></li>)}
        <li>
          <img src="/icons/links/link.svg" alt="" />
          <a target="_blank" rel="noopener noreferrer" href="https://dondesang.efs.sante.fr/donner-les-etapes-du-don/lefs-et-vous" title="Ouverture dans une nouvelle fenêtre">Consignes après don</a>
        </li>
        <li>
          <img src="/icons/links/link.svg" alt="" />
          <a target="_blank" rel="noopener noreferrer" href="https://dondesang.efs.sante.fr/qui-peut-donner-les-contre-indications/tout-savoir-sur-les-contre-indications" title="Ouverture dans une nouvelle fenêtre">Les contre-indications du don du sang</a>
        </li>

        <li>
          <PDFLink href="https://dondesang.efs.sante.fr/sites/default/files/Donner/EFS_Information%20pr%C3%A9alable%20au%20don_fev2018_n5_VD_BD.pdf" title="Indications pré-don" />
        </li>
        <li>
          <PDFLink href="https://dondesang.efs.sante.fr/sites/default/files/Donner/EFS_QUESTION_PREALABLE%20AU%20DON_METROPOLE_210X297_janv2018_BD.pdf" title="Formulaire pré-don - Metropole" />
        </li>
        <li>
          <PDFLink href="https://dondesang.efs.sante.fr/sites/default/files/Donner/EFS_QUESTION_PREALABLE%20AU%20DON_DOM_210X297_janv2018_BD.pdf" title="Formulaire pré-don - DOM" />
        </li>
      </ul>

      <h3>En savoir plus</h3>
      <ul className="list-unstyled">
        {MORE_VIDEOS.map(video => <li key={video.url}><YoutubeModalLink {...video} /></li>)}
        <li>
          <img src="/icons/links/link.svg" alt="" />
          <a target="_blank" rel="noopener noreferrer" href="https://dondesang.efs.sante.fr/" title="Ouverture dans une nouvelle fenêtre">Site de l'Etablissement Français du Sang </a>
        </li>
      </ul>
    </div>
  );
}

export default AboutContainer;