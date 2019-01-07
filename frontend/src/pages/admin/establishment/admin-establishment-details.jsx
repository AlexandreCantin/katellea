import React, { Component } from 'react';
import Loader from '../../../generics/loader/loader';
import { AdminCityEstablishmentService } from '../../../services/admin/admin-city-establishment.service';

export class AdminEstablishmentDetails extends Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      establishment: undefined
    }
  }

  async componentDidMount() {
    try {
      const establishment = await AdminCityEstablishmentService.getEstablishment(this.props.establishmentId)
      this.setState({ loading: false, establishment });
    } catch(err) {
      this.setState({ loading: false });
    }
  }

  render() {
    const { loading, establishment } = this.state;

    if(loading) return <Loader />;
    if(!loading && !establishment) return <div className="alert danger">Erreur lors de la récupération de l'établissement.</div>;
    if(!loading) return (<div><pre>{JSON.stringify(establishment, '', 2)}</pre></div>);
  }

}
