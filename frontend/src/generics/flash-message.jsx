import React, { Component } from 'react';
import { connect } from 'react-redux';

import { FLASH_MESSAGE_TYPE } from '../services/flash-message/flash-message';
import store from '../services/store';
import { isEmpty, extractKey } from '../services/helper';

class FlashMessage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      scope: this.props.scope
    };

    this.flashMessageElementRef = React.createRef();

    // FlashMessage type to css class
    this.typeToCss = new Map();
    this.typeToCss.set(FLASH_MESSAGE_TYPE.INFO, 'info');
    this.typeToCss.set(FLASH_MESSAGE_TYPE.WARNING, 'warning');
    this.typeToCss.set(FLASH_MESSAGE_TYPE.ERROR, 'error');
    this.typeToCss.set(FLASH_MESSAGE_TYPE.SUCCESS, 'success');
  }


  componentDidMount() {
    // Check if a flashMessage exists
    let flashMessage = store.getState().flashMessage;

    if (!isEmpty(flashMessage) && !flashMessage.display && FlashMessage.isCurrentScope(flashMessage, this.state.scope)) {
      this.setState({ flashMessage });
    }
  }

  componentDidUpdate() {
    // Scroll to notification
    if(this.state.flashMessage && this.flashMessageElementRef.current && this.props.doScroll) {
      // FIXME: for weird reasons, scrollIntoView make Header/Title disappears !
      const flashMessageTop = this.flashMessageElementRef.current.offsetTop;
      window.scrollTo(0, flashMessageTop);
    }
  }

  static getDerivedStateFromProps(nextProps, currentState) {
    let flashMessage = store.getState().flashMessage;

    if (isEmpty(flashMessage)) {
      currentState.flashMessage = undefined;
    } else if (FlashMessage.isCurrentScope(flashMessage, currentState.scope)) {
      currentState.flashMessage = flashMessage;
    }
    return currentState;
  }


  static isCurrentScope(flashMessage, scope) {
    return scope === flashMessage.scope;
  }

  getFlashMessageClass = () => this.typeToCss.get(this.state.flashMessage.type);


  render() {
    const { flashMessage } = this.state;
    if (!flashMessage) return null;

    // Mark as display but without refresh state
    flashMessage.display = true;

    return (
      <div className={'alert ' + this.getFlashMessageClass()} ref={this.flashMessageElementRef}>
        <ul className="list-unstyled list-no-margin-padding">{flashMessage.messages.map((message) => <li key={message.substr(0, 10)}>{message}</li>)}</ul>
      </div>
    );
  }
}

export default connect(state => extractKey(state, 'flashMessage'))(FlashMessage);