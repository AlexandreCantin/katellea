import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { UserService } from '../../services/user/user.service';

const DIRECTION = {
  BOTH: { img: 'both.png', text: 'Vous pouvez donner et recevoir du sang de votre parrain/marraine. Cool !' },
  LEFT: { img: 'left.png', text: 'Vous pouvez recevoir du sang de votre parrain/marraine mais pas lui en donner.' },
  RIGHT: { img: 'right.png', text: 'Vous pouvez donner votre sang à votre parrain/marraine mais pas inversement.' },
  NO: { img: 'no.png', text: 'Votre groupe sanguin n\'est pas compatible avec celui de votre parrain/marraine. Dommage !' },
};

export default class SponsorCompatibility extends Component {
  static propTypes = { userBloodType: PropTypes.string.isRequired }

  constructor(props) {
    super(props);
    this.state = {
      direction: undefined
    };
  }

  shouldComponentUpdate(previousProps, previousState) {
    if(previousProps.userBloodType !== this.props.userBloodType) return true;
    if(previousState.direction !== this.state.direction) return true;
    return false;
  }

  componentDidUpdate(previousProps, previousState) {
    if(previousProps.userBloodType !== this.props.userBloodType) this.getDirection();
  }
  componentDidMount() { this.getDirection(); }

  async getDirection() {
    if(this.props.userBloodType === 'UNKNOWN' || this.props.userBloodType === undefined) {
      this.setState({ direction: undefined });
    } else {
      const newDirection = await UserService.getSponsorCompatibility(this.props.userBloodType);
      this.setState({ direction: newDirection });
    }
  }

  render() {
    const { direction } = this.state;
    if(!direction) return null;

    let directionData = DIRECTION[direction];
    return (
      <>
        <h2>Compatibilité avec votre parrain</h2>
        <div className="alert info">{directionData.text}</div>
        <img className="img-responsive" src={'/img/sponsor-compatibility/' + directionData.img} alt="" />
      </>
    );
  }
}
