import React, { Component } from 'react';
import { navigate } from '@reach/router';


import { isEmpty } from '../services/helper';

import store from '../services/store';
import { USER_TEMP_ACTIONS } from '../services/user-temp/user-temp.reducers';

const FAKE_USERS = [
  { name: 'JohnDoe', data: { id: '1', token: 'johndoe' } },
  { name: 'DrManhattan', data: { id: '2', token: 'manhattan' } },
  { name: 'JackSparrow', data: { id: '3', token: 'jack' } },
  { name: 'JamesBond', data: { id: '4', token: 'jamesbond' } },
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

  doFakeLogin = (event) => {
    event.preventDefault();

    let userName = event.target.innerText;
    let user = FAKE_USERS.find(user => user.name === userName);
    store.dispatch({
      type: USER_TEMP_ACTIONS.SET_PROFILE,
      data: { userID: user.data.id, origin: 'facebook', accessToken: user.data.token }
    });
  };


  render() {
    return (
      <fieldset style={{ margin: '20px auto 0 auto' }}>
        <legend>!!! Développement seulement !!!</legend>

        <ul className="list-unstyled inline-list">
          {
            FAKE_USERS.map(fake => (
              <li key={fake.name}>
                <button onClick={this.doFakeLogin} id={fake.name}>{fake.name}</button>
              </li>)
            )
          }
        </ul>
      </fieldset>
    );
  }
}