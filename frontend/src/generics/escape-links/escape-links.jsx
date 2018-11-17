import React from 'react';

require('./escape-links.scss');

function EscapeLinks({ links }) {
  return (
    <ul id="escape-links">
      {links.map(link => <a key={link.href} href={link.href} title={'Aller à la page : ' + link.text}>{link.text}</a>)}
    </ul>
  );
}

export default EscapeLinks;