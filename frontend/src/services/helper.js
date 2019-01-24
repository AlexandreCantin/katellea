import store from './store';

export function getParameterByName(name) {
  let match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

export function getLocalStorageValue(field) {
  const val = localStorage.getItem(field);
  if(val === null) return '';
  return val;
}

export function saveToLocalStorage(data) {
  Object.keys(data).map(key => localStorage.setItem(key, data[key]));
}

export function getKatelleaTokenHeaders(addToken = true) {
  let headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (addToken) {
    const user = store.getState().user;
    headers['Katellea-Token'] = user ? user.katelleaToken : '';
  }

  return headers;
}


// Detect is the given object is empty
export function isEmpty(obj) {
  return obj === undefined || obj === null || Object.keys(obj).length === 0;
}


export function extractKey(state, path, specificKey = undefined) {

  // Get value by path : user.establishment
  let keyPath = path.split('.');
  let value;
  for(let i = 0; i < keyPath.length; i++) {
    let newKey = keyPath[i];
    value = value ? value[newKey] : state[newKey];
  }

  // Compute result
  let res = {};
  let keyName = specificKey || keyPath[keyPath.length - 1];
  res[keyName] = value;

  return res;
}


// Auto-scroll to anchor in component
export function scrollToHash() {
  if (window.location.hash) {
    let id = window.location.hash.replace('#', '');
    let $el = document.getElementById(id);
    if ($el) $el.scrollIntoView();
  }
}


// Check if object contains all the given properties
export const hasOwnProperties = (obj, properties) => {
  for(let i=0; i < properties.length; i++) {
    if(!obj.hasOwnProperty(properties[i])) return false;
  }
  return true;
};

export const isEnter = (e) => e.key === 'Enter';

export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);