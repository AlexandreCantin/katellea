const EARTH_RADIUS = 6378137; // Earth radius

export const convertRad = value => Math.PI * value / 180;

export const computeDistance = (pointA, pointB) => {

  const latA = convertRad(pointA.lat);
  const lonA = convertRad(pointA.lng);
  const latB = convertRad(pointB.lat);
  const lonB = convertRad(pointB.lng);

  let distance = EARTH_RADIUS * (Math.PI / 2 - Math.asin(Math.sin(latB) * Math.sin(latA) + Math.cos(lonB - lonA) * Math.cos(latB) * Math.cos(latA)));

  // We want the distance from the center, so we divided the distance by 2
  distance = distance / 2;

  return Math.trunc(distance / 1000);
};
