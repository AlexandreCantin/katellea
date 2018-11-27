import express from 'express';
import * as Sentry from '@sentry/node';
import { environment } from '../../conf/environment';
import { NOT_FOUND } from 'http-status-codes';

const rootRoutes = express.Router();

const reactRouteData = {
  'root': {
    title: 'Parrainage pour le don du sang, plasma et plaquettes | Katellea',
    canonical: environment.frontUrl + '/'
  },
  'create-account': {
    title: 'Créer votre compte | Katellea',
    canonical: environment.frontUrl + '/creer-votre-compte'
  },
  'token': {
    title: 'Parrainage pour le don du sang, plasma et plaquettes | Katellea',
    canonical: environment.frontUrl + '/token'
  },
  'legal-terms': {
    title: 'Mentions légales | Katellea',
    canonical: environment.frontUrl + '/mentions-legales'
  },
  'mission-team': {
    title: 'Notre équipe et notre mission | Katellea',
    canonical: environment.frontUrl + '/notre-mission-et-notre-equipe'
  },
  'contact': {
    title: 'Nous contacter | Katellea',
    canonical: environment.frontUrl + '/nous-contacter'
  },
};

// For now : get only data
const getRouteData = function(path, withCanonical=true) {
  // TODO: handle social network metas
  const data = reactRouteData[path];
  if(!data) Sentry.captureException(new Error(`Route data not found for path: ${path}`));
  if(!withCanonical) delete data['canonical'];

  return data || getRouteData('root'); // Default route fallback
};

rootRoutes.get('/', (req, res) => res.render('index', getRouteData('root')));
rootRoutes.get('/creer-votre-compte', (req, res) => res.render('index', getRouteData('create-account')));
rootRoutes.get('/token', (req, res) => res.render('index', getRouteData('/token'))); // TODO: handle social network metas
rootRoutes.get('/mentions-legales', (req, res) => res.render('index', getRouteData('legal-terms')));
rootRoutes.get('/notre-mission-et-notre-equipe', (req, res) => res.render('index', getRouteData('mission-team')));
rootRoutes.get('/nous-contacter', (req, res) => res.render('index', getRouteData('contact')));

// Connected routes : no need to specific SEO values
rootRoutes.get('/tableau-de-bord', (req, res) => res.render('index', getRouteData('root', false)));
rootRoutes.get('/don-courant', (req, res) => res.render('index', getRouteData('root', false)));
rootRoutes.get('/historique-des-dons', (req, res) => res.render('index', getRouteData('root', false)));
rootRoutes.get('/mon-compte', (req, res) => res.render('index', getRouteData('root', false)));

// Not found : need to be handle server-side in order to make GoogleBot detect the 404 http status
rootRoutes.get('*', (req, res) => res.status(NOT_FOUND).render('not-found'));


export default rootRoutes;
