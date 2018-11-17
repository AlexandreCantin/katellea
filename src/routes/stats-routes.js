import express from 'express';

import Statistics from '../models/stat';
import { NOT_FOUND } from 'http-status-codes';

const statisticsRoutes = express.Router();

const getLastStatistics = async (req, res) => {
  const lastStatistic = await Statistics.find({}).sort({ createdAt: +1 }).limit(1);
  if (!lastStatistic) return res.status(NOT_FOUND).send();

  return res.json(lastStatistic[0]);
};

statisticsRoutes.get('/last', getLastStatistics);
export default statisticsRoutes;
