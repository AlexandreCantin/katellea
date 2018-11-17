export const FLASH_MESSAGE_TYPE = {
  INFO: 0,
  WARNING: 1,
  ERROR: 2,
  SUCCESS: 3
};

export class FlashMessage {
  constructor({ type, scope, messages }) {
    this.type = type;
    this.scope = scope;
    this.display = false;

    // Handle when string given to get an array
    if (typeof messages === 'string') messages = [messages];
    this.messages = messages;
  }
}
