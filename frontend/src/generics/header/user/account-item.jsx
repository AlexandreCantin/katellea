import React, { useState } from 'react';
import { Link } from '@reach/router';
import cx from 'classnames';

import LogoutButton from '../../logout-button';

function HeaderAccountItem({ user }) {
  const [hover, setHover] = useState(false);

  const expandMenu = () => { if (!hover) setHover(true); }
  const hideMenu = () => { if (hover) setHover(false); }
  const toggleHover = () => setHover(!hover);

  const renderAccountDropdown = () => {
    return (
      <ul id="account-dropdown" className={cx('dropdown list-unstyled', { 'sr-only': !hover })} aria-label="submenu">
        <li><Link to="/mon-profil">Mon profil</Link></li>
        <li><LogoutButton /></li>
      </ul>
    );
  }

  return (
    <div role="menuitem" className="my-account dropdown-container" onMouseEnter={expandMenu} onMouseLeave={hideMenu}>
      <button className="btn reset has-dropdown" aria-haspopup="true" aria-expanded={hover ? 'true' : 'false'} aria-controls="#account-dropdown" onClick={toggleHover}>
        {user.name}
      </button>
      {renderAccountDropdown()}
    </div>
  );
}

export default HeaderAccountItem;