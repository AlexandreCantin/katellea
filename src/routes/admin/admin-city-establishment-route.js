import express from 'express';

import City from '../../models/city';
import Establishment from '../../models/establishment';
import { injectUserFromToken } from '../../middlewares/inject-user-from-token';
import { sendError } from '../../helper';
import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';

const adminCityEstablishmentRoutes = express.Router();
adminCityEstablishmentRoutes.use(injectUserFromToken);


const getAllCities = async (req, res) => {
  let page = +req.query.page || 0;
  let pageSize = +req.query.pageSize || 30;

  const cities = await City.find({}).sort({ _id: +1 }).skip(page*pageSize).limit(pageSize);
  return res.json(cities);
}


const searchCities = async (req, res) => {
  const term = req.query.term;

  const cities = await City.find({
    $or: [
      { name: new RegExp(term, 'i') },
      { zipcode: new RegExp(term, 'i') }
    ]
  });

  return res.json(cities);
}


const getTotalCitiesNumber = async (req, res) => {
  const cityTotalCount = await City.countDocuments({});
  return res.json(cityTotalCount);
}


const getAllEstablishments = async (req, res) => {
  const establishments = await Establishment.find({}).sort({ _id: +1 });

  // Note: little hack to keep internalComment and verified fields (see 'toJSON' in models/establishment.js)
  const establishmentsAsObject = establishments.map(establishment => establishment.toObject());

  return res.json(establishmentsAsObject);
}


const searchEstablishment = async (req, res) => {
  const term = req.query.term;

  const establishments = await Establishment.find({
    $or: [
      { name: new RegExp(term, 'i') },
      { address: new RegExp(term, 'i') },
      { zipcode: new RegExp(term, 'i') },
      { email: new RegExp(term, 'i') }
    ]
  });

  return res.json(establishments);
}

const getEstablishment = async (req, res) => {
  const establishment = await Establishment.findById(req.params.id);
  if (establishment == null) return res.status(NOT_FOUND).send();

  // Note: little hack to keep internalComment and verified fields (see 'toJSON' in models/establishment.js)
  return res.json(establishment.toObject());
};

const saveEstablishment = async (req, res) => {
  const establishmentId = +req.params.id;
  const verified = req.body.verified;
  const internalComment = req.body.internalComment;

  try {
    await Establishment.findByIdAndUpdate({ _id: establishmentId }, { verified, internalComment });

    return res.status(OK).send();
  } catch (err) {
    sendError(err);
    return res.status(INTERNAL_SERVER_ERROR).send();
  }
}

adminCityEstablishmentRoutes.get('/city', getAllCities);
adminCityEstablishmentRoutes.get('/city/search', searchCities);
adminCityEstablishmentRoutes.get('/city/count', getTotalCitiesNumber);

adminCityEstablishmentRoutes.get('/establishment', getAllEstablishments);
adminCityEstablishmentRoutes.get('/establishment/search', searchEstablishment);
adminCityEstablishmentRoutes.get('/establishment/:id', getEstablishment);
adminCityEstablishmentRoutes.put('/establishment/:id', saveEstablishment);

export default adminCityEstablishmentRoutes;
