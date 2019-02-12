import React from 'react';

require('./escape-links.scss');

function EscapeLinks({ links }) {
  return (
    <ul className="list-unstyled" id="escape-links">
      {links.map(link => <li key={link.href}><a href={link.href} title={'Aller à la page : ' + link.text}>{link.text}</a></li>)}
    </ul>
  );
}

export default EscapeLinks;