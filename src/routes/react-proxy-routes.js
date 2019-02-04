import express from 'express';
import * as Sentry from '@sentry/node';
import { environment } from '../../conf/environment';
import { NOT_FOUND } from 'http-status-codes';

import User from '../models/user';
import Donation from '../models/donation';
import { sendError } from '../helper';


const rootRoutes = express.Router();

const TITLE_DEFAULT = "Accompagnement don du sang - Katellea";
const DESCRIPTION_DEFAULT = "Parrainer et accompagner un proche pour son premier don du sang";

const computeTitleAndDescription = async (path, req) => {
  // TOKEN routes
  let title = TITLE_DEFAULT;
  let description = DESCRIPTION_DEFAULT;

  if(path === 'token') {

    // Sponsor token
    if(req.query.hasOwnProperty('sponsor')) {
      try {
        const sponsor = await User.findOne({ sponsorToken : removeOrigin(req.query.sponsor) });
        title = `Don du sang : Faites-vous parrainer par ${sponsor.name}`;
      } catch(err) {
        sendError(err);
      }
    }

    return { title, description };
  }

  // DONATION ROUTES
  if(path.startsWith('/donation') && req.params.donationToken) {
    try {
      const donation = await Donation.findOne({ donationToken : req.params.donationToken });

      let name;
      if(donation.isPublicDonation) {
        name = donation.createdByGuest.name;
      } else {
        const creator = await User.findById(donation.createdBy);
        name = creator.name;
      }

      if(name) title = `Rejoignez la proposition de don faite par ${name}`;
      return { title, description };

    } catch(err) {
      sendError(err);
    }
  }

  return { title, description };
}

const removeOrigin = (token) => {
  // Token: dir-T5h7x99 => T5h7x99
  if(token.indexOf('-') > 0) return token.split('-')[1];
  return token;
}


const reactRouteData = {
  'root': {
    title: 'Parrainage pour le don du sang, plasma et plaquettes | Katellea'
  },
  'donation': {
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
const getRouteData = async(path, extraPath, req) => {
  let data = reactRouteData[path];
  if(!data) {
    Sentry.captureException(new Error(`Route data not found for path: ${path}`));
    data = await getRouteData('root', '/');
  }
  data.canonical = environment.frontUrl + extraPath;

  // Social network metas
  const metaData = await computeTitleAndDescription(path, req);
  data.title = metaData.title || TITLE_DEFAULT;
  data.description = metaData.description || DESCRIPTION_DEFAULT;

  return data; // Default route fallback
};

rootRoutes.get('/', async (req, res) => res.render('index', await getRouteData('root', '/')));
rootRoutes.get('/creer-votre-compte', async (req, res) => res.render('index', await getRouteData('create-account', '/creer-votre-compte')));

rootRoutes.get('/email-verification', async (req, res) => res.render('index', await getRouteData('root', '/')));
rootRoutes.get('/donation/:donationToken', async (req, res) => res.render('index', await getRouteData('donation', '/donation', req)));
rootRoutes.get('/token', async (req, res) => res.render('index', await getRouteData('token', '/token', req)));

rootRoutes.get('/mentions-legales', async (req, res) => res.render('index', await getRouteData('legal-terms', '/mentions-legales')));
rootRoutes.get('/notre-mission-et-notre-equipe', async (req, res) => res.render('index', await getRouteData('mission-team', ' /notre-mission-et-notre-equipe')));
rootRoutes.get('/nous-contacter', async (req, res) => res.render('index', await getRouteData('contact', '/nous-contacter')));
rootRoutes.get('/presse', async (req, res) => res.render('index', await getRouteData('presse', '/presse')));

// Connected routes and admin : no need to specific SEO values
rootRoutes.get('/tableau-de-bord', async (req, res) => res.render('index', await getRouteData('root', '/')));
rootRoutes.get('/don-courant', async (req, res) => res.render('index', await getRouteData('root', '/')));
rootRoutes.get('/historique-des-dons', async (req, res) => res.render('index', await getRouteData('root', '/')));
rootRoutes.get('/mon-profil', async (req, res) => res.render('index', await getRouteData('root', '/')));

rootRoutes.get('/admin', async (req, res) => res.render('index', await getRouteData('root', '/')));
rootRoutes.get('/admin/utilisateurs', async (req, res) => res.render('index', await getRouteData('root', '/')));
rootRoutes.get('/admin/statistiques', async (req, res) => res.render('index', await getRouteData('root', '/')));
rootRoutes.get('/admin/etablissements', async (req, res) => res.render('index', await getRouteData('root', '/')));
rootRoutes.get('/admin/villes', async (req, res) => res.render('index', await getRouteData('root', '/')));
rootRoutes.get('/admin/logs', async (req, res) => res.render('index', await getRouteData('root', '/')));

// Not found : need to be handle server-side in order to make GoogleBot detect the 404 http status
rootRoutes.get('*', (req, res) => res.status(NOT_FOUND).render('not-found'));


export default rootRoutes;
