import jwt from 'jwt-simple';
import dayjs from 'dayjs';
import { environment } from '../../conf/environment';

const SECRET_TOKEN = environment.jwtSecret;
const TOKEN_DURATION = 30; // 30 days

/**
 * Service with functions relative to JWT Tokens handling
*/
class JWTServiceFactory {

  encode(user) {
    const payload = {
      'id': user._id,
      'expires': dayjs().add(TOKEN_DURATION, 'day')
    };
    return jwt.encode(payload, SECRET_TOKEN);
  }


  decode(token) {
    return jwt.decode(token, SECRET_TOKEN) || {};
  }


  validate(payload) {
    let validate = false;
    if(payload.expires) {
      const expires = dayjs(payload.expires);
      const today = dayjs(new Date());
      if(today.isBefore(expires)) validate = true;
    }

    if(!validate) throw new Error('Invalid token');
  }


  decodeAndValidate(token) {
    let payload = {};
    try {
      payload = this.decode(token);
      this.validate(payload);
    } catch(err) {
      return {};
    }
    return payload;
  }

}

// Export as singleton
const jwtServiceFactory = new JWTServiceFactory();
Object.freeze(jwtServiceFactory);
export { jwtServiceFactory as JWTService };
