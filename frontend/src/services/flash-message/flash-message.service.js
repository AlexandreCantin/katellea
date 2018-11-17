import { FLASH_MESSAGE_ACTIONS } from './flash-message.reducers';
import store from '../store';

class FlashMessageServiceFactory {
  createInfo(messages, scope) {
    store.dispatch({
      type: FLASH_MESSAGE_ACTIONS.CREATE_INFO,
      data: { messages, scope }
    });
  }

  createWarning(messages, scope) {
    store.dispatch({
      type: FLASH_MESSAGE_ACTIONS.CREATE_WARNING,
      data: { messages, scope }
    });
  }

  createError(messages, scope) {
    store.dispatch({
      type: FLASH_MESSAGE_ACTIONS.CREATE_ERROR,
      data: { messages, scope }
    });
  }

  createSuccess(messages, scope) {
    store.dispatch({
      type: FLASH_MESSAGE_ACTIONS.CREATE_SUCCESS,
      data: { messages, scope }
    });
  }

  deleteFlashMessage() {
    store.dispatch({
      type: FLASH_MESSAGE_ACTIONS.DELETE
    });
  }
}


// Export as singleton
const flashMessageService = new FlashMessageServiceFactory();
Object.freeze(flashMessageService);
export { flashMessageService  as FlashMessageService };