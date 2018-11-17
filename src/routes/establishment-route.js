import express from 'express';
import City from '../models/city';
import Establishment from '../models/establishment';

import { computeDistance } from '../helpers/distance.helper';
import { NOT_FOUND, BAD_REQUEST } from 'http-status-codes';

const establishmentRoutes = express.Router();


const getClosest = async (req, res) => {
  // Zipcode
  if (req.query.zipcode) return getEstablishmentFromZipcode(req.query.zipcode, res);

  // Longitude/Latitude
  if (req.query.longitude && req.query.latitude) {
    const { longitude, latitude } = req.query;

    if (isNaN(parseFloat(longitude)) || isNaN(parseFloat(latitude))) {
      res.status(BAD_REQUEST).send('No float values given for longitude, latitude (or both)');
      return;
    }
    return getEstablishmentFromCoordinates(longitude, latitude, res);
  }

  res.status(BAD_REQUEST).send('No zipcode or longitude/latitude point given');
};


/** Return the closest EFS establishment associated to the given zipcode */
const getEstablishmentFromZipcode = async (zipcode, res) => {
  const city = await City.findOne({ zipcode });

  if (city == null) return res.status(NOT_FOUND).send('Pas de ville associée à ce code postal');

  return getEstablishmentFromCoordinates(city.longitude, city.latitude, res);
};


/* Return the closest establishment, based on longitude and latitude given */
const getEstablishmentFromCoordinates = async (longitude, latitude, res) => {

  const establishments = await Establishment.find({
    coordinates: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      }
    },
    // #Beta
    longitude: { $gt: -2.8, $lt: -0.9 },
    latitude: { $gt: 46.8833, $lt: 47.88 },
  }).limit(3);

  establishments.forEach(es => {
    es.distance = computeDistance({ lng: es.longitude, lat: es.latitude }, { lng: longitude, lat: latitude });
  });

  return res.json(establishments);
};


// Routes
establishmentRoutes.get('/closest', getClosest);

export default establishmentRoutes;
