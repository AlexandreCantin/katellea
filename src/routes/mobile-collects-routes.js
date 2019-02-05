import express from 'express';
import City from '../models/city';

import { computeDistance } from '../helpers/distance.helper';
import { NOT_FOUND, BAD_REQUEST } from 'http-status-codes';
import MobileCollect from '../models/mobile-collect';

const mobileCollectsRoutes = express.Router();


const getClosest = async (req, res) => {
  // Zipcode
  if (req.query.zipcode) return getMobileCollectsFromZipcode(req.query.zipcode, res);

  // Longitude/Latitude
  if (req.query.longitude && req.query.latitude) {
    const { longitude, latitude } = req.query;

    if (isNaN(parseFloat(longitude)) || isNaN(parseFloat(latitude))) {
      res.status(BAD_REQUEST).send('No float values given for longitude, latitude (or both)');
      return;
    }
    return getMobileCollectsFromCoordinates(longitude, latitude, res);
  }

  res.status(BAD_REQUEST).send('No zipcode or longitude/latitude point given');
};


/**
 * Return the closest EFS MobileCollects associated to the given zipcode
 */
const getMobileCollectsFromZipcode = async (zipcode, res) => {
  const city = await City.findOne({ zipcode });

  if (city == null) return res.status(NOT_FOUND).send('Pas de ville associée à ce code postal');

  return getMobileCollectsFromCoordinates(city.longitude, city.latitude, res);
};


/* Return the closest MobileCollects, based on longitude and latitude given */
const getMobileCollectsFromCoordinates = async (longitude, latitude, res) => {

  const mobileCollects = await MobileCollect.find({
    coordinates: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      }
    },
    // #Beta
    longitude: { $gt: -4.958, $lt: 1.042605 },
    latitude: { $gt: 46.181568, $lt: 48.874451 },
  }).limit(10);

  mobileCollects.forEach(mc => {
    mc.distance = computeDistance({ lng: mc.longitude, lat: mc.latitude }, { lng: longitude, lat: latitude });
  });

  return res.json(mobileCollects);
};


// Routes
mobileCollectsRoutes.get('/closest', getClosest);

export default mobileCollectsRoutes;
