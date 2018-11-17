// Check if object contains all the given properties
export const hasOwnProperties = (obj, properties) => {
  for(let i=0; i < properties.length; i++) {
    if(!obj.hasOwnProperty(properties[i])) return false;
  }
  return true;
};
