import React, { Component } from 'react';
import { connect } from 'react-redux';

import { FLASH_MESSAGE_TYPE } from '../services/flash-message/flash-message';
import store from '../services/store';
import { isEmpty, extractKey } from '../services/helper';

class FlashMessage extends Component {

  constructor(props) {
    super(props);
    this.state = {};

    // FlashMessage type to css class
    this.typeToCss = new Map();
    this.typeToCss.set(FLASH_MESSAGE_TYPE.INFO, 'info');
    this.typeToCss.set(FLASH_MESSAGE_TYPE.WARNING, 'warning');
    this.typeToCss.set(FLASH_MESSAGE_TYPE.ERROR, 'error');
    this.typeToCss.set(FLASH_MESSAGE_TYPE.SUCCESS, 'success');
  }


  componentWillMount() {
    // Check if a flashMessage exists
    let flashMessage = store.getState().flashMessage;

    if (!isEmpty(flashMessage) && !flashMessage.display && this.isCurrentScope(flashMessage)) {
      this.setState({ flashMessage });
    }
  }

  componentWillReceiveProps() {
    let flashMessage = store.getState().flashMessage;

    if (isEmpty(flashMessage)) {
      this.setState({ flashMessage: undefined });
    } else if (this.isCurrentScope(flashMessage)) {
      this.setState({ flashMessage });
    }
  }


  isCurrentScope(flashMessage) {
    return this.props.scope === flashMessage.scope;
  }

  getFlashMessageClass = () => this.typeToCss.get(this.state.flashMessage.type);


  render() {
    const { flashMessage } = this.state;
    if (!flashMessage) return null;

    // Mark as display but without refresh state
    flashMessage.display = true;

    return (
      <div className={'alert ' + this.getFlashMessageClass()}>
        <ul className="list-no-margin-padding">{flashMessage.messages.map((message) => <li key={message.substr(0, 10)}>{message}</li>)}</ul>
      </div>
    );
  }
}

export default connect(state => extractKey(state, 'flashMessage'))(FlashMessage);