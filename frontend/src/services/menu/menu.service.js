import { MENU_ACTIONS } from './menu.reducer';
import store from '../store';

class MenuServiceFactory {

  openMenu() {
    store.dispatch({ type: MENU_ACTIONS.OPEN_MENU });
  }

  closeMenu() {
    store.dispatch({ type: MENU_ACTIONS.CLOSE_MENU });
  }
}

// Export as singleton
const menuService = new MenuServiceFactory();
Object.freeze(menuService);
export { menuService  as MenuService };