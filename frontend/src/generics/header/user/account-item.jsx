import React, { useState } from 'react';
import LogoutButton from '../../logout-button';
import { Link } from '@reach/router';

require('./header-user.scss');

function HeaderAccountItem({ user }) {
  const [hover, setHover] = useState(false);

  const expandMenu = () => { if (!hover) setHover(true); }
  const hideMenu = () => { if (hover) setHover(false); }
  const toggleHover = () => setHover(!hover);

  const renderAccountDropdown = () => {
    return (
      <ul id="account-dropdown" className="dropdown list-unstyled" aria-label="submenu">
        <li><Link to="/mon-compte">Mon compte</Link></li>
        <li><LogoutButton /></li>
      </ul>
    );
  }

  return (
    <div role="menuitem" className="my-account dropdown-container" onMouseEnter={expandMenu} onMouseLeave={hideMenu}>
      <button className="btn reset has-dropdown" aria-haspopup="true" aria-expanded={hover ? 'true' : 'false'} aria-controls="#account-dropdown" onClick={toggleHover}>
        {user.firstName + ' ' + user.lastName}
      </button>
      {hover ? renderAccountDropdown() : null}
    </div>
  );
}

export default HeaderAccountItem;