import React, { Component } from 'react';
import Helmet from 'react-helmet';

import HeaderHome from '../../generics/header/home/header-home';
import HeaderUser from '../../generics/header/user/header-user';

import Menu from '../../generics/menu/menu';
import { isEmpty } from '../../services/helper';
import store from '../../services/store';
import Breadcrumb from '../../generics/breadcrumb/breadcrumb';
import EscapeLinks from '../../generics/escape-links/escape-links';

export default class LegalTerms extends Component {

  constructor(props) {
    super(props);

    this.state = {
      hasUser: !isEmpty(store.getState().user)
    };
  }

  render() {
    const { hasUser } = this.state;

    let escapeLinks = [];
    escapeLinks.push({ href: '#header', text: 'En-tête de la page' });
    if (hasUser) escapeLinks.push({ href: '#menu', text: 'Menu' });
    escapeLinks.push({ href: '#main-content', text: 'Contenu principal' });

    return (
      <div className={`page text-only ${hasUser ? 'has-menu' : ''}`}>
        <Helmet title="Mentions légales" titleTemplate="%s | Katellea" />

        <EscapeLinks links={escapeLinks} />

        <div id="header" className="sr-only">&nbsp;</div>
        {hasUser ? <HeaderUser /> : <HeaderHome />}

        <Breadcrumb links={[{ href: '/mentions-legales', text: 'Mentions légales' }]} />

        <div id="legal-terms">
          {hasUser ? <div id="menu" className="sr-only">&nbsp;</div> : null}
          {hasUser ? <Menu /> : null}

          <main id="main-content">
            <h1>Mentions légales</h1>

            <div className="text-center"><em>Dernière date de mise à jour : 17 octobre 2018.</em></div>

            <h2>1. Informations légales</h2>
            <h3>Editeur</h3>
            <p>
              Katellea<br />
            </p>

            <h3>Directeur de la publication</h3>
            <p>Alexandre CANTIN</p>

            <h3>Hébergeur</h3>
            <p>
              OVH<br />
              2 rue Kellermann<br />
              59100 Roubaix<br />
              Tél. 09 72 10 10 07<br />
            </p>

            <h2>2. Objet du site internet <a className="native" href="//katellea.fr">katellea.fr</a></h2>
            <p>Le site internet <a className="native" href="//katellea.fr">katellea.fr</a> a pour objectif de favoriser l’accompagnement entre individus en vue de la réalisation de dons de sang/plasma/plaquttes.</p>

            <h2>3. Données collectées</h2>
            <p>Les seules données collectées, pour permettre le fonctionnement du service, sont :</p>
            <ul>
              <li>les informations de profil de l'utilisateur : nom, prénom, adresse e-mail, parrain, membres parrainés, informations relatives à l'historique de dons du membre, informations entrées par l'utilisateur dans le cadre de sondage, discussions ou message privé.</li>
              <li>liste des collectes mobiles de l'Etablissement Français du Sang via <a className="native" href="https://www.data.gouv.fr/fr/datasets/dates-et-lieux-des-collectes-de-don-du-sang/">https://www.data.gouv.fr/fr/datasets/dates-et-lieux-des-collectes-de-don-du-sang/</a></li>
            </ul>

            <p>
              Toutefois, l’utilisateur est informé que conformément aux articles 39 et suivants de la loi n°78-17 du 6 janvier 1978 relative à l’informatique, aux fichiers et aux libertés,
              il dispose d’un droit d’accès aux informations le concernant dans la <a className="native" href="//katellea.fr/mon-compte">page dédiée à la gestion de son compte</a> (nécessite d'être authentifié).<br />
              Pour plus d'informations, l'utilisateur dispose d'un <a className="native" href="//katellea.fr/nous-contacter">formulaire de contact</a>.
            </p>

            <h2>4. Cookies</h2>
            <p>
              Katellea utilise des cookies permettant d’enregistrer des informations relatives à la navigation de l’utilisateur de manière anonyme et dans un but d’analyses statistiques.
              Les cookies générés ont une durée de conservation limitée à 12 mois. Ces cookies sont émis par les sociétés Google (via Goole Analytics), Hotjar, OpenStreetMap et Youtube.
              Vous trouverez <a className="native" href="https://privacy.google.com/businesses/">toutes les informations sur la conformité / CGU de Google Analytics ici.</a>
              L’utilisateur peut s’opposer à l'enregistrement de cookies sur son ordinateur.
            </p>

            <h3>4.1 Supprimer mes cookies</h3>
            <p>Comment supprimer mes cookies ?</p>
            <iframe title="Vidéo de la CNIL intitulé : Comment supprimer mes cookies" width="800" height="450" src="https://www.youtube.com/embed/Ij9EkAQzVvM?feature=oembed" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen>&nbsp;</iframe>

            <h2>5. Sites tiers</h2>
            <p>Des appels vers des services tiers sont effectués. Ils concernent le bon fonctionnement du site (authentification, mailing, analyse d'usage...) par exemple.</p>
            <p>Liste non exhaustives de services tiers :</p>
            <ul>
              <li>Facebook</li>
              <li>Google</li>
              <li>Twitter</li>
              <li>Instagram</li>
              <li>Google Analytics</li>
              <li>Hotjar</li>
              <li>Youtube</li>
              <li>www.data.gouv.fr</li>
              <li>MailJet</li>
              <li>OpenStreetMap</li>
            </ul>

            <h2>6. Fonctionnement du service</h2>
            <p>
              Le service proposé sur le site <a className="native" href="//katellea.fr">katellea.fr</a> a pour objectif de favoriser l’accompagnement entre individus en vue de la réalisation de dons de sang/plasma/plaquettes.
              Pour se faire, l'utilisateur pourra communiquer sur les réseaux sociaux, répondre à des sondages, discuter avec d'autres membres...
            </p>

            <h2>7. Obligations de l'utilisateur</h2>
            <p>L’utilisateur du site reconnaît avoir pris connaissance et accepter les présentes conditions d’utilisation avant toute utilisation du site.</p>
            <p>L’utilisation du site internet <a className="native" href="//katellea.fr">katellea.fr</a> est soumise au respect par  l’utilisateur de : la législation française et les présentes conditions d’utilisation.</p>
            <p>Les présentes conditions d’utilisation peuvent être modifiées à tout moment ; la date de mise à jour est mentionnée. Ces modifications sont opposables à l’utilisateur dès leur mise en ligne sur le site internet <a className="native" href="//katellea.fr">katellea.fr</a>. L’utilisateur est donc invité à consulter régulièrement la dernière version mise à jour.</p>

            <h2>8. Propriété intellectuelle</h2>
            <p>Le site web <a className="native" href="//katellea.fr">katellea.fr</a> est protégé au titre des dispositions relatives au droit d’auteur défini aux articles L.111-1 et suivants du code de la propriété intellectuelle et au titre des dispositions relatives aux bases de données définies aux articles L.341-1 et suivants du même code.</p>
            <p>Sans préjudice des dispositions prévues à l’article L.122-5 du code de la propriété intellectuelle, toute représentation, reproduction ou diffusion, intégrale ou partielle du site, sur quelque support que ce soit, sans l'autorisation expresse et préalable de Katellea constitue un acte de contrefaçon, sanctionné au titre des articles L.335-2 et L.335.3 du même code.</p>
            <p>Par ailleurs, la marque Katellea est protégée au titre des articles L.712-1 et suivants du code de la propriété intellectuelle. Toute représentation, reproduction ou diffusion, intégrale ou partielle de la marque Katellea, sur quelque support que ce soit, sans l'autorisation expresse et préalable de Katellea constitue un acte de contrefaçon, sanctionné au titre des articles L.716-1 du même code.</p>

            <h2>9. Crédits</h2>
            <p>Les cartes générées utilisent le service <a className="native" href="https://www.openstreetmap.org/">https://www.openstreetmap.org/</a></p>
            <p>Les données des collectes mobiles sont récupérés via <a className="native" href="https://www.data.gouv.fr/fr/datasets/dates-et-lieux-des-collectes-de-don-du-sang/">https://www.data.gouv.fr/fr/datasets/dates-et-lieux-des-collectes-de-don-du-sang/</a></p>
            <p>Icons made by <a className="native" href="http://www.freepik.com" title="Freepik">Freepik</a> from <a className="native" href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a className="native" href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank" rel="noopener noreferrer">CC 3.0 BY</a></p>
            <p>Icons made by <a href="https://www.flaticon.com/authors/dimitry-miroliubov" title="Dimitry Miroliubov">Dimitry Miroliubov</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" rel="noopener noreferrer" target="_blank">CC 3.0 BY</a></p>
          </main>
        </div>
      </div>
    );
  }
}
