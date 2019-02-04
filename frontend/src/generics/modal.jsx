import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { GoogleAnalyticsService } from '../services/google-analytics.service';
import cx from 'classnames';
import PropTypes from 'prop-types';

/**
 *
 * Accessibility rules for modal :
 * - When the Modal is not open, it is not rendered into the DOM ==> need to be handle in parent component
 * - ✅ When rendered, the Modal is appended to the end of document.body. ==> Done with preact-portal
 * - ✅ The Modal has relevant WAI-ARIA attributes in accordance with accessibility guidelines
 *    => aria-modal="true"
 *    => role="dialog" ou "alertdialog" (last one if immediate attention is required)
 *    => aria-label
 * - ✅ Pressing the escape key will close the Modal.
 * - ✅ Clicking outside the Modal will close it.
 * - ✅ When open, scrolling is frozen on the main document beneath the Modal.
 * - ✅ When open, focus is drawn immediately to the Modal's close button.
 * - ✅ When the Modal closes, focus returns to the Modal's trigger button.
 * - ✅ Focus is trapped within the Modal when open => ensure by tabindex="-1"
 *
 * Sources :
 *  - https://assortment.io/posts/accessible-modal-component-react-portals-part-1
 *  - https://assortment.io/posts/accessible-modal-component-react-portals-part-2
 */

// Focus handling inspired by https://github.com/ghosh/micromodal
const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
  'select:not([disabled]):not([aria-hidden])',
  'textarea:not([disabled]):not([aria-hidden])',
  'button:not([disabled]):not([aria-hidden])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex^="-"])'
];

const TAB_KEY = 9;
const ECHAP_KEY = 27;

export default class Modal extends Component {
  static defaultProps = { level: '1' }
  static propTypes = { level: PropTypes.string }

  constructor(props) {
    super(props);

    // For accessibility
    this.modalSelector = '#modal.modal';
    if(this.isSecondLevel()) this.modalSelector += '.level-2';
    this.modalSelector += ' .modal-content';

    this.state = {
      role: this.props.role || 'dialog',
      hideClose: this.props.hideClose || false
    }
  }

  componentDidMount() {
    // Google Analytics
    // Note: To disable the sending to GA (ex: in back office), you have to add a noModalUrl prop
    if(!this.props.noModalUrl) {
      if(!this.props.modalUrl) throw new Error("No modal url defined");
      GoogleAnalyticsService.sendModalView(this.props.modalUrl);
    }

    // Register last focus element
    this.activeElement = document.activeElement;

    // Register focusable nodes + Focus to the close button
    this.focusableNodes = document.querySelector(this.modalSelector).querySelectorAll(FOCUSABLE_ELEMENTS);
    this.currentFocusIndex = 0;
    this.focusableNodes[this.currentFocusIndex].focus();

    // Disabled global scroll
    if(!this.isSecondLevel()) document.querySelector('html').classList.add('lock-scroll');
  }

  componentDidUpdate() {
    this.focusableNodes = document.querySelector(this.modalSelector).querySelectorAll(FOCUSABLE_ELEMENTS);
  }

  componentWillUnmount() {
    // Enabled scroll on the whole document
    if(!this.isSecondLevel()) document.querySelector('html').classList.remove('lock-scroll');
  }

  onKeyDown = (e) => {
    // Echap key
    if (e.keyCode === ECHAP_KEY) { e.preventDefault(); this.closeModal(); }

    // Shift-alt-key => previous focusable element
    if (e.shiftKey && e.keyCode === TAB_KEY) {
      e.preventDefault(); e.stopPropagation(); this.focusPreviousNode();
    } else if (e.keyCode === TAB_KEY) {
      // Tab key only
      e.preventDefault(); e.stopPropagation(); this.focusNextNode();
    }
  }
  focusNextNode() {
    this.currentFocusIndex = this.currentFocusIndex + 1;
    if (this.currentFocusIndex >= this.focusableNodes.length) this.currentFocusIndex = 0;
    this.focusableNodes[this.currentFocusIndex].focus();
  }
  focusPreviousNode() {
    this.currentFocusIndex = this.currentFocusIndex - 1;
    if (this.currentFocusIndex < 0) this.currentFocusIndex = this.focusableNodes.length - 1;
    this.focusableNodes[this.currentFocusIndex].focus();
  }
  updateFocusableElements = () => {
    const modalContent = document.querySelector(this.modalSelector);
    if(!modalContent) return;

    this.focusableNodes = modalContent.querySelectorAll(FOCUSABLE_ELEMENTS);

    // Reset the focus on the first element if needed
    if(this.currentFocusIndex >= this.focusableNodes.length) {
      this.currentFocusIndex = 0;
      this.focusableNodes[this.currentFocusIndex].focus();
    }
  }


  isSecondLevel() {
    return this.props.level === '2';
  }
  computeCssClass() {
    return cx('modal-body', this.props.cssClass);
  }

  closeModal = () => {
    if (this.state.hideClose) return;

    // Focus on the last element
    this.activeElement.focus(); // FIXME: not working (element is always: <body></body>)
    this.props.onClose();
  }

  render() {
    const { title, children } = this.props;
    const { role, hideClose } = this.state;

    const childrenWithProps = React.Children.map(children, child => {
      if(child === null) return null;
      return React.cloneElement(child, { updateFocusableElements: this.updateFocusableElements })
    });

    return ReactDOM.createPortal(
      <div id="modal" className={cx('modal', { 'level-2': this.props.level === '2'})} aria-modal="true" tabIndex="-1" role={role} aria-label={title} onKeyDown={this.onKeyDown}>
        <div className="dark-background" onClick={this.closeModal}>&nbsp;</div>
        <div className="modal-content">
          {!hideClose ? <button className="btn close" onClick={this.closeModal} ref={c => this.closeButton = c}><span className="sr-only">Close</span>X</button> : null}
          <div className="modal-title"><h1>{title}</h1></div>

          <div className={this.computeCssClass()}>{childrenWithProps}</div>
        </div>
      </div>, document.body);
  }
}