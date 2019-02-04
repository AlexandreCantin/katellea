import { FlashMessage, FLASH_MESSAGE_TYPE } from './flash-message';
import { EMPTY } from '../../enum';

export const FLASH_MESSAGE_ACTIONS = {
  CREATE_INFO: 'CREATE_INFO',
  CREATE_WARNING: 'CREATE_WARNING',
  CREATE_ERROR: 'CREATE_ERROR',
  CREATE_SUCCESS: 'CREATE_SUCCESS',
  DELETE: 'DELETE'
};

export const FLASH_MESSAGE_REDUCERS = (state = EMPTY, action) => {
  switch (action.type) {
    case FLASH_MESSAGE_ACTIONS.CREATE_INFO:
      return new FlashMessage({ type: FLASH_MESSAGE_TYPE.INFO, scope: action.data.scope, messages: action.data.messages });

    case FLASH_MESSAGE_ACTIONS.CREATE_WARNING:
      return new FlashMessage({ type: FLASH_MESSAGE_TYPE.WARNING, scope: action.data.scope, messages: action.data.messages });

    case FLASH_MESSAGE_ACTIONS.CREATE_ERROR:
      return new FlashMessage({ type: FLASH_MESSAGE_TYPE.ERROR, scope: action.data.scope, messages: action.data.messages });

    case FLASH_MESSAGE_ACTIONS.CREATE_SUCCESS:
      return new FlashMessage({ type: FLASH_MESSAGE_TYPE.SUCCESS, scope: action.data.scope, messages: action.data.messages });

    case FLASH_MESSAGE_ACTIONS.DELETE:
      return {};

    default:
      return state;
  }
};
