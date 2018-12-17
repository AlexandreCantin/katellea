import express from 'express';
import path from 'path';
import { NOT_FOUND, UNAUTHORIZED, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import * as Sentry from '@sentry/node';

import { GRPD_EXPORT_STATUS } from '../constants';
import logger from '../services/logger.service';
import GRPDExport from '../models/grpd-export';

import { generateRandomString } from '../helpers/string.helper';
import { injectUserFromToken } from '../middlewares/inject-user-from-token';


const grpdRoutes = express.Router();
grpdRoutes.use(injectUserFromToken);

const getGRPDExport = async (req, res) => {
  const currentGRPD = await GRPDExport.findOne({ user: req.userId, status: GRPD_EXPORT_STATUS.ASKED });
  if(currentGRPD) return res.json(currentGRPD);
  res.status(NOT_FOUND).send();
};

const getGrpdPdf = async (req, res) => {
  let token = req.params.token;
  // Remove sensible path character
  token = token.replace(/\./g, '');
  token = token.replace(/\//g, '');

  const pdfFile = path.join('./src/pdf/', `${token}.pdf`);
  res.download(pdfFile, err => {
    if (err) return res.status(NOT_FOUND).send();
  });
};


const createGRPDExport = async (req, res) => {
  // Already have an grpd
  const grpdExisting = await GRPDExport.findOne({ user: req.userId, status: GRPD_EXPORT_STATUS.ASKED });
  if(grpdExisting) {
    res.status(UNAUTHORIZED).send();
    return;
  }


  let grpd;
  // Recycle GRPDExport if user already have one canceled
  const grpdCancelled = await GRPDExport.findOne({ user: req.userId, status: GRPD_EXPORT_STATUS.CANCELED });
  if(grpdCancelled) {
    grpd = grpdCancelled;
  } else {
    // Create RGPD
    grpd = new GRPDExport();
    grpd.user = req.userId;
    grpd.token = generateRandomString(30);
  }
  grpd.status = GRPD_EXPORT_STATUS.ASKED;

  try {
    await grpd.save();

    const grpdCreated = await GRPDExport.findById(grpd._id);
    return res.json(grpdCreated);
  } catch(err) {
    Sentry.captureException(err);
    logger.error(err);
    return res.status(INTERNAL_SERVER_ERROR).send();
  }
};


const deleteGRPDExport = async (req, res) => {
  const grpd = await GRPDExport.findOne({ user: req.userId, status: GRPD_EXPORT_STATUS.ASKED });

  // No RGPD found
  if(!grpd) {
    res.status(NOT_FOUND).send();
    return;
  }

  try {
    grpd.status = GRPD_EXPORT_STATUS.CANCELED;
    await GRPDExport.findOneAndUpdate({ _id: grpd.id }, grpd);
    return res.send('GRPDExport deleted');
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
    return res.status(INTERNAL_SERVER_ERROR).send();
  }
};


grpdRoutes.get('/pdf/:token', getGrpdPdf);
grpdRoutes.get('/', getGRPDExport);
grpdRoutes.post('/', createGRPDExport);
grpdRoutes.delete('/', deleteGRPDExport);

export default grpdRoutes;
