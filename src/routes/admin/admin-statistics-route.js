import express from 'express';

import Statistics from '../../models/stat';

const adminStatisticsRoutes = express.Router();

const getLastStatistics = async (req, res) => {
  const lastStatistics = await Statistics.find({}).sort({ createdAt: +1 }).limit(30);
  return res.json(lastStatistics);
};

adminStatisticsRoutes.get('/last', getLastStatistics);
export default adminStatisticsRoutes;
