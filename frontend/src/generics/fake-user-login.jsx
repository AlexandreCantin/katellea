import React, { Component } from 'react';
import { navigate } from '@reach/router';

import { isEmpty } from '../services/helper';

import store from '../services/store';
import { environment } from '../environment';
import { USER_ACTIONS } from '../services/user/user.reducers';

const FAKE_USERS = [
  { name: 'John Doe', socialNetworkKey: 'facebook_johndoe' },
  { name: 'Dr Manhattan', socialNetworkKey: 'facebook_manhattan' },
  { name: 'Jack Sparrow', socialNetworkKey: 'facebook_jack' },
  { name: 'James Bond', socialNetworkKey: 'facebook_jamesbond' },
];

export default class FakeUserLogin extends Component {

  componentDidMount() {
    // When we get an user : go to dashboard or current-giving
    this.storeUnsubscribeFn = store.subscribe(() => {
      let user = store.getState().user;

      if (!isEmpty(user) && user.isProfileComplete()) {
        if (user.hasCurrentDonation()) { navigate('/don-courant'); return; }
        navigate('/tableau-de-bord');
      }
    });
  }

  componentWillUnmount() {
    this.storeUnsubscribeFn();
  }

  doFakeLogin = async (event) => {
    event.preventDefault();
    let socialNetworkKey = event.target.getAttribute('data-key');

    const userResponse = await fetch(`${environment.SERVER_URL}/auth/fake/${socialNetworkKey}`);
    if(userResponse.status === 200) {
      const userData = await userResponse.json();

      localStorage.setItem('USER_TOKEN', userData.katelleaToken);

      store.dispatch({
        type: USER_ACTIONS.SET_USER,
        data: userData
      });
    }



  };


  render() {
    return (
      <fieldset style={{ margin: '20px auto 0 auto' }}>
        <legend>!!! Développement seulement !!!</legend>

        <ul className="list-unstyled inline-list">
          {
            FAKE_USERS.map(fake => (
              <li key={fake.socialNetworkKey}>
                <button onClick={this.doFakeLogin} data-key={fake.socialNetworkKey}>{fake.name}</button>
              </li>)
            )
          }
        </ul>
      </fieldset>
    );
  }
}