import React, { Component } from 'react';
import { AdminUserService } from '../../../services/admin/admin-user.service';
import Loader from '../../../generics/loader/loader';

export class AdminUserDetails extends Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      user: undefined
    }
  }

  async componentDidMount() {
    try {
      const user = await AdminUserService.getUser(this.props.userId)
      this.setState({ loading: false, user });
    } catch(err) {
      this.setState({ loading: false });
    }
  }

  render() {
    const { loading, user } = this.state;

    if(loading) return <Loader />;
    if(!loading && !user) return <div className="alert danger">Erreur lors de la récupération de l'utilisateur.</div>;
    if(!loading) return (<div><pre>{JSON.stringify(user, '', 2)}</pre></div>);
  }

}
