import store from './store';

export function getParameterByName(name) {
  let match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

export function getKatelleaTokenHeaders(addToken = true) {
  let headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (addToken) headers['Katellea-Token'] = store.getState().user.katelleaToken;

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

export const isEnter = (e) => e.key === 'Enter';