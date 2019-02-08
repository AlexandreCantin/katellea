import React, { Component } from 'react';
import { UserService } from '../../../services/user/user.service';
import Loader from '../../../generics/loader/loader';

const DIRECTION = {
  BOTH: { img: 'both-simple.png', text: 'Vous pouvez donner et recevoir de son sang. Cool !' },
  LEFT: { img: 'left-simple.png', text: 'Vous pouvez recevoir son sang mais pas lui en donner.' },
  RIGHT: { img: 'right-simple.png', text: 'Vous pouvez donner votre sang mais pas inversement.' },
  NO: { img: 'no-simple.png', text: 'Votre groupe sanguin n\'est pas compatible. Dommage !' },
};

export default class MyNetworkDetails extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      networkUsers: []
    }
  }

  async componentDidMount() {
    try {
      const networkUsers =  await UserService.getNetwork();
      this.setState({ loading: false, networkUsers });
    } catch(err) {
      this.setState({ loading: false });
    }
  }

  render() {
    const { loading, networkUsers } = this.state;

    if(loading) return <Loader />;

    return (
      <div>
        <table className="">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Compatibilité sanguine</th>
            </tr>
          </thead>
          <tbody>
            {
              networkUsers.map(user => (
                <tr key={ user._id}>
                  <td>{ user.name }</td>
                  <td>
                    { user.compatibility ?
                      <>
                        <img src={'/img/user-compatibility/' + DIRECTION[user.compatibility].img } alt="" />
                        <span>{ DIRECTION[user.compatibility].text }</span>
                      </> : <span>Compatibilité inconnue</span>
                    }
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    );
  }
}