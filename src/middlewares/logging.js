import morgan from 'morgan';
import morganJson from 'morgan-json';

const loggingMiddleware = morgan(
  morganJson(':remote-addr :remote-user :date :method :url :status :res[content-length] :referrer :user-agent :response-time ms')
);

export default loggingMiddleware;
