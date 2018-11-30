import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import * as Sentry from '@sentry/node';
import logger from '../services/logger.service';

const errorHandler = (err, req, res, next) => {
  if (!err) return next();

  Sentry.captureException(err);
  logger.error(err.message);

  if (res.headersSent) return next(err);
  res.status(INTERNAL_SERVER_ERROR).send('Internal server error');
};

export default errorHandler;
