import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { DONATION_STATUS } from '../../../../services/donation/donation';
import PollDates from './poll-dates';
import PollAnswer from './poll-answer';
import PollForm from './poll-form';
import dayjs from 'dayjs';
import { connect } from 'react-redux';
import { extractKey } from '../../../../services/helper';
import DonationCard from '../../../../generics/donation/donation-card/donation-card';

class Poll extends Component {
  static PropTypes = { donation: PropTypes.object.isRequired }


  constructor(props) {
    super(props);

    this.state = {
      donationPollOnGoing: this.props.donation.status === DONATION_STATUS.POLL_ON_GOING,
      unavailablePollSuggestions: Poll.determineUnavaiblePollSuggestions(this.props.user, this.props.donation.pollSuggestions)
    };
  }

  static getDerivedStateFromProps(nextProps, currentState) {
    if (currentState.donationPollOnGoing && nextProps.donation.isPollEnded()) {
      currentState.donationPollOnGoing = false;
      currentState.userPoll = undefined;
    }

    if(!nextProps.user.id) return currentState;
    currentState.unavailablePollSuggestions = Poll.determineUnavaiblePollSuggestions(nextProps.user, nextProps.donation.pollSuggestions);

    return currentState;
  }


  static determineUnavaiblePollSuggestions(user, pollSuggestions) {
    if(!user.id) return [];

    let minimumDate = dayjs(user.minimumDate);
    return pollSuggestions.filter(pollSuggestion => dayjs(pollSuggestion.date).isBefore(minimumDate));
  }


  // RENDER
  renderUnavaiblePollSuggestions(unavailablePollSuggestions) {
    if (unavailablePollSuggestions.length === 0) return null;

    if (unavailablePollSuggestions.length === this.props.donation.pollSuggestions.length) {
      return (
        <div className="alert error">L'ensemble des dates proposées entrent en conflit avec votre période d'indisponibilité</div>
      );
    }

    return (
      <div className="alert info">
        Certaines dates entrent en conflit avec votre période d'indisponibilité. Elles sont mises en valeur par un fond rouge.
      </div>
    );
  }
  renderActions(actions) {
    if (actions.length > 0) return null;

    return (
      <ul className="action">
        {actions.map(action => <li>{action.name}</li>)}
      </ul>
    );
  }

  render() {
    const { donation } = this.props;
    const { donationPollOnGoing, unavailablePollSuggestions } = this.state;

    return (
      <div className="poll block-base">

        {donationPollOnGoing ?
          <div className="alert info">Veuillez renseigner vos disponibilités.</div> :
          <div className="alert info">Le sondage a été clotûré</div>
        }

        {this.renderUnavaiblePollSuggestions(unavailablePollSuggestions)}
        <DonationCard donation={donation} />

        <div className="poll-table">
          <PollDates donation={donation} />
          {donation.pollAnswers.map(pa => <PollAnswer key={pa._id} donation={donation} pollAnswer={pa} />)}
          {donationPollOnGoing ? <PollForm donation={donation} unavailablePollSuggestions={unavailablePollSuggestions} /> : null}
        </div>
      </div>
    );
  }
}

export default connect(state => extractKey(state, 'user'))(Poll);
