import React from 'react';
import { navigate } from '@reach/router';

import { UserService } from '../services/user/user.service';

const LogoutButton = () => {

  const callLogout = (e) => {
    e.preventDefault();
    UserService.logout();
    navigate('/');
  }

  return (<a href="/logout" className="logout" onClick={callLogout}>Se déconnecter</a>);
}

export default LogoutButton;