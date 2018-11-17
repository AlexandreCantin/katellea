import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import * as Sentry from '@sentry/node';

const errorHandler = (err, req, res, next) => {
  if (!err) return next();

  Sentry.captureException(err);
  console.error(err);

  if (res.headersSent) return next(err);
  res.status(INTERNAL_SERVER_ERROR).send('Internal server error');
};

export default errorHandler;
