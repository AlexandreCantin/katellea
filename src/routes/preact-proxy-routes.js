import express from 'express';
import path from 'path';

const rootRoutes = express.Router();

const servePreactIndex = (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', '..', 'frontend', 'build', 'index.html'));
};

rootRoutes.get('*', servePreactIndex);
rootRoutes.get('/test', servePreactIndex);

export default rootRoutes;
