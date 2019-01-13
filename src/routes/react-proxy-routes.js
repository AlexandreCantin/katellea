import express from 'express';
import * as Sentry from '@sentry/node';
import { environment } from '../../conf/environment';
import { NOT_FOUND } from 'http-status-codes';

const rootRoutes = express.Router();

const reactRouteData = {
  'root': {
    title: 'Parrainage pour le don du sang, plasma et plaquettes | Katellea'
  },
  'create-account': {
    title: 'Créer votre compte | Katellea'
  },
  'token': {
    title: 'Parrainage pour le don du sang, plasma et plaquettes | Katellea'
  },
  'legal-terms': {
    title: 'Mentions légales | Katellea'
  },
  'mission-team': {
    title: 'Notre équipe et notre mission | Katellea'
  },
  'presse': {
    title: 'Kit presse | Katellea'
  },
  'contact': {
    title: 'Nous contacter | Katellea'
  },
};

// For now : get only data
const getRouteData = function(path, extraPath) {
  // TODO: handle social network metas
  let data = reactRouteData[path];
  if(!data) {
    Sentry.captureException(new Error(`Route data not found for path: ${path}`));
    data = getRouteData('root', '/');
  }
  data.canonical = environment.frontUrl + extraPath;
  return data; // Default route fallback
};

rootRoutes.get('/', (req, res) => res.render('index', getRouteData('root', '/')));
rootRoutes.get('/creer-votre-compte', (req, res) => res.render('index', getRouteData('create-account', '/creer-votre-compte')));
rootRoutes.get('/token', (req, res) => res.render('index', getRouteData('token', '/token'))); // TODO: handle social network metas
rootRoutes.get('/mentions-legales', (req, res) => res.render('index', getRouteData('legal-terms', '/mentions-legales')));
rootRoutes.get('/notre-mission-et-notre-equipe', (req, res) => res.render('index', getRouteData('mission-team', ' /notre-mission-et-notre-equipe')));
rootRoutes.get('/nous-contacter', (req, res) => res.render('index', getRouteData('contact', '/nous-contacter')));
rootRoutes.get('/presse', (req, res) => res.render('index', getRouteData('presse', '/presse')));

// Connected routes and admin : no need to specific SEO values
rootRoutes.get('/tableau-de-bord', (req, res) => res.render('index', getRouteData('root', '/')));
rootRoutes.get('/don-courant', (req, res) => res.render('index', getRouteData('root', '/')));
rootRoutes.get('/historique-des-dons', (req, res) => res.render('index', getRouteData('root', '/')));
rootRoutes.get('/mon-profil', (req, res) => res.render('index', getRouteData('root', '/')));

rootRoutes.get('/admin', (req, res) => res.render('index', getRouteData('root', '/')));
rootRoutes.get('/admin/utilisateurs', (req, res) => res.render('index', getRouteData('root', '/')));
rootRoutes.get('/admin/statistiques', (req, res) => res.render('index', getRouteData('root', '/')));
rootRoutes.get('/admin/etablissements', (req, res) => res.render('index', getRouteData('root', '/')));
rootRoutes.get('/admin/villes', (req, res) => res.render('index', getRouteData('root', '/')));
rootRoutes.get('/admin/logs', (req, res) => res.render('index', getRouteData('root', '/')));

// Not found : need to be handle server-side in order to make GoogleBot detect the 404 http status
rootRoutes.get('*', (req, res) => res.status(NOT_FOUND).render('not-found'));


export default rootRoutes;
