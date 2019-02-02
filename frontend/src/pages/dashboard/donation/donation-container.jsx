import React, { Component } from 'react';
import { connect } from 'react-redux';
import { navigate } from '@reach/router';

import DonationCreateFormModal from '../../../generics/donation/donation-create-form/donation-create-form-modal';
import { DonationService } from '../../../services/donation/donation.service';
import Loader from '../../../generics/loader/loader';
import DonationToSubscribe from './donation-to-subscribe';
import DonationCard from '../../../generics/donation/donation-card/donation-card';
import store from '../../../services/store';
import { extractKey, isEmpty } from '../../../services/helper';
import { FlashMessageService } from '../../../services/flash-message/flash-message.service';

require('./donation_container.scss');

class DonationContainer extends Component {

  constructor(props) {
    super(props);

    this.userHasCurrentDonation = store.getState().user.hasCurrentDonation();

    this.state = {
      loading: true,
      eligibleDonations: []
    };
  }

  componentDidMount() {
    let user = store.getState().user;
    this.updateUserDonationStatus(user);

    this.storeUnsubscribeFn = store.subscribe(() => {
      let user = store.getState().user;
      if (isEmpty(user)) return;

      let newUserHasCurrentDonation = store.getState().user.hasCurrentDonation();
      if (!this.userHasCurrentDonation && newUserHasCurrentDonation) {
        this.userHasCurrentDonation = true;
        FlashMessageService.createSuccess('Félicitations, vous venez de rejoindre cette proposition de don !', 'donation');
        navigate('/don-courant');
      }
    });
  }

  componentWillUnmount() {
    this.storeUnsubscribeFn();
  }

  static getDerivedStateFromProps(nextProps, currentState) {
    if (nextProps.currentDonation) {
      currentState.loading = false;
    }
    return currentState;
  }

  updateUserDonationStatus(user) {
    if (user.hasCurrentDonation()) {
      DonationService.getCurrentDonation(user.currentDonation);
    } else {
      DonationService.getEligibleDonations()
        .then(donations => this.setState({ loading: false, eligibleDonations: donations }))
        .catch(err => { this.setState({ loading: false }); console.error(err); });
    }
  }

  // RENDER
  render() {
    const { currentDonation, user } = this.props;
    const { loading, eligibleDonations } = this.state;

    if (loading) return (<div id="donation" className="block-base text-center"><Loader /></div>);

    else if (!isEmpty(currentDonation)) {
      return (<div id="donation" className="block-base"><DonationCard donation={currentDonation} /> </div>);
    }

    else if(user.quotaExceeded) {
      return (
        <div id="donation" className="block-base">
          <div className="alert danger text-center">
            Vous avez atteint vos 4 dons annuels possible.
            Vous devrez donc attendre l'année prochaine afin de réaliser un nouveau don.
          </div>
          <div className="new-donation-container text-center">
            <DonationCreateFormModal modalUrl="/tableau-de-bord/nouveau-don" />
          </div>
        </div>
      );
    }

    return (
      <div id="donation" className="block-base">
        {eligibleDonations.length === 0 ? <p>Nous n'avons trouvé aucun don à rejoindre :-(</p> : null}
        {eligibleDonations.map(donation => <DonationToSubscribe key={donation._id} donation={donation} />)}

        <div className="new-donation-container text-center">
          <DonationCreateFormModal modalUrl="/tableau-de-bord/nouveau-don" />
        </div>
      </div>
    );
  }
}

export default connect(state => (Object.assign({}, extractKey(state, 'donation', 'currentDonation'), extractKey(state, 'user'))))(DonationContainer);
