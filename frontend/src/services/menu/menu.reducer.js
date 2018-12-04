export const MENU_ACTIONS = {
  OPEN_MENU: 'OPEN_MENU',
  CLOSE_MENU: 'CLOSE_MENU'
};

export const MENU_REDUCERS = (state = false, action) => {
  switch (action.type) {
    case MENU_ACTIONS.OPEN_MENU:
      return true;

    case MENU_ACTIONS.CLOSE_MENU:
      return false;

    default:
      return state;
  }
};
