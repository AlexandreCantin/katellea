import React, { Component } from 'react';
import { UserService } from '../../../services/user/user.service';
import Loader from '../../../generics/loader/loader';

const DIRECTION = {
  BOTH: { img: 'both-simple.png', text: 'Vous pouvez donner et recevoir du sang de votre filleul/filleule. Cool !' },
  LEFT: { img: 'left-simple.png', text: 'Vous pouvez recevoir du sang de votre filleul/filleule mais pas lui en donner.' },
  RIGHT: { img: 'right-simple.png', text: 'Vous pouvez donner votre sang à votre filleul/filleule mais pas inversement.' },
  NO: { img: 'no-simple.png', text: 'Votre groupe sanguin n\'est pas compatible avec celui de votre filleul/filleule. Dommage !' },
};

export default class MyGodchildsDetails extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      godchilds: []
    }
  }

  async componentDidMount() {
    try {
      const godchilds =  await UserService.getGodchilds();
      this.setState({ loading: false, godchilds });
    } catch(err) {
      this.setState({ loading: false });
    }
  }

  render() {
    const { loading, godchilds } = this.state;

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
              godchilds.map(godchild => (
                <tr key={godchild._id}>
                  <td>{ godchild.name }</td>
                  <td>
                    { godchild.compatibility ?
                      <>
                        <img src={'/img/sponsor-compatibility/' + DIRECTION[godchild.compatibility].img } alt="" />
                        <span>{ DIRECTION[godchild.compatibility].text }</span>
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