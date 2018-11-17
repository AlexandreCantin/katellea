import React from 'react';

const PDFLink = props => (
  <span>
    <img src="/icons/links/pdf.svg" alt="Fichier PDF" />
    <a target="_blank" rel="noopener noreferrer" title="Ouverture dans une nouvelle fenêtre" href={props.href}>{props.title}</a>
  </span>
);

export default PDFLink;