import React, { Component } from 'react';
import Helmet from 'react-helmet';

import HeaderHome from '../../generics/header/home/header-home';
import HeaderUser from '../../generics/header/user/header-user';

import { GoogleAnalyticsService } from '../../services/google-analytics.service';

import Menu from '../../generics/menu/menu';
import { isEmpty } from '../../services/helper';
import store from '../../services/store';
import Breadcrumb from '../../generics/breadcrumb/breadcrumb';
import EscapeLinks from '../../generics/escape-links/escape-links';

require('./legal-terms.scss');

export default class LegalTerms extends Component {

  constructor(props) {
    super(props);

    this.state = {
      hasUser: !isEmpty(store.getState().user)
    };
  }

  componentDidMount() { GoogleAnalyticsService.sendPageView(); }

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
              il dispose d’un droit d’accès aux informations le concernant dans la <a className="native" href="//katellea.fr/mon-profil">page dédiée à la gestion de son compte</a> (nécessite d'être authentifié).<br />
              Pour plus d'informations, l'utilisateur dispose d'un <a className="native" href="//katellea.fr/nous-contacter">formulaire de contact</a>.
            </p>

            <h2>4. Cookies et données personnelles</h2>
            <h3>Liste des cookies et finalités</h3>
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Service émetteur</th>
                  <th>Durée</th>
                  <th>Finalité</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>_ga</td>
                  <td>Google Analytics</td>
                  <td>1 an</td>
                  <td>Suivi de la provenance et des comportements des utilisateurs sur le site</td>
                </tr>
                <tr>
                  <td>_gat</td>
                  <td>Google Analytics</td>
                  <td>Fin de la session</td>
                  <td>Etude des actions des utilisateurs sur le site</td>
                </tr>
                <tr>
                  <td>_git</td>
                  <td>Google Analytics</td>
                  <td>24h</td>
                  <td>Analyse Géographique de la provenance des utilisateurs</td>
                </tr>
                <tr>
                  <td>_hjDonePolls</td>
                  <td>Hotjar</td>
                  <td>1 an</td>
                  <td>Limiter l'affichage des formulaire(s) à une seule fois par personne</td>
                </tr>
                <tr>
                  <td>_hjIncludedInSample</td>
                  <td>Hotjar</td>
                  <td>Fin de la session</td>
                  <td>Ce cookie est configuré pour permettre à Hotjar de savoir si le comportement d’un visiteur a déjà été analysé ou non.</td>
                </tr>
              </tbody>
            </table>

            <h3>Liste des données personnelles stockées et finalités</h3>
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Finalité/Raison</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Nom complet</td>
                  <td>Affichage de votre nom dans l'interface et les e-mails</td>
                </tr>
                <tr>
                  <td>E-mail</td>
                  <td>Pour l'envoi d'e-mails liés à Katellea (évènements, actions à réaliser...) ou lors de campagnes de promotion liées à Katellea.</td>
                </tr>
                <tr>
                  <td>Sexe</td>
                  <td>
                    Le nombre de dons du sang maximal par an n'est pas le même pour les femmes et les hommes (respectivement 4 et 6).
                    Cette information nous permet ainsi de gérer cela.<br />
                    <em>L'utilisateur peut choisir de n'indiquer aucun sexe</em>
                  </td>
                </tr>
                <tr>
                  <td>Historiques des dons</td>
                  <td>Sert à des fins statistiques mais aussi informative pour l'utilisateur</td>
                </tr>
                <tr>
                  <td>Commentaires et réponses aux sondages liés aux propositions de dates</td>
                  <td>Informations liées à l'interaction de l'utilisateur au sein d'une proposition de dons en cours ou passées.</td>
                </tr>
                <tr>
                  <td>Groupe sanguin</td>
                  <td>Indiquer à l'utilisateur sa compatibilité vis-à-vis de son parrain/marraine et de ses filleuls/filleules.</td>
                </tr>
                <tr>
                  <td>Etablissement EFS de référence</td>
                  <td>Etablissement proposé par défaut lors de la création d'une nouvelle proposition de don.</td>
                </tr>
              </tbody>
            </table>

            <p>L’utilisateur peut s’opposer à l'enregistrement de certains cookies sur son ordinateur.</p>
            <p>Vous trouverez <a className="native" href="https://privacy.google.com/businesses/">toutes les informations sur la conformité / CGU de Google Analytics ici.</a></p>

            <h3>4.1 Supprimer mes cookies</h3>
            <p>Comment supprimer mes cookies ?</p>
            <div className="youtube-video">
              <iframe title="Vidéo de la CNIL intitulé : Comment supprimer mes cookies" width="800" height="450" src="https://www.youtube.com/embed/Ij9EkAQzVvM?feature=oembed" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen>&nbsp;</iframe>
            </div>

            <h2>5. Fonctionnement du service</h2>
            <p>
              Le service proposé sur le site <a className="native" href="//katellea.fr">katellea.fr</a> a pour objectif de favoriser l’accompagnement entre individus en vue de la réalisation de dons de sang/plasma/plaquettes.
              Pour se faire, l'utilisateur pourra communiquer sur les réseaux sociaux, répondre à des sondages, discuter avec d'autres membres...
            </p>

            <h2>6. Obligations de l'utilisateur</h2>
            <p>L’utilisateur du site reconnaît avoir pris connaissance et accepter les présentes conditions d’utilisation avant toute utilisation du site.</p>
            <p>L’utilisation du site internet <a className="native" href="//katellea.fr">katellea.fr</a> est soumise au respect par  l’utilisateur de : la législation française et les présentes conditions d’utilisation.</p>
            <p>Les présentes conditions d’utilisation peuvent être modifiées à tout moment ; la date de mise à jour est mentionnée. Ces modifications sont opposables à l’utilisateur dès leur mise en ligne sur le site internet <a className="native" href="//katellea.fr">katellea.fr</a>. L’utilisateur est donc invité à consulter régulièrement la dernière version mise à jour.</p>

            <h2>7. Propriété intellectuelle</h2>
            <p>Le site web <a className="native" href="//katellea.fr">katellea.fr</a> est protégé au titre des dispositions relatives au droit d’auteur défini aux articles L.111-1 et suivants du code de la propriété intellectuelle et au titre des dispositions relatives aux bases de données définies aux articles L.341-1 et suivants du même code.</p>
            <p>Sans préjudice des dispositions prévues à l’article L.122-5 du code de la propriété intellectuelle, toute représentation, reproduction ou diffusion, intégrale ou partielle du site, sur quelque support que ce soit, sans l'autorisation expresse et préalable de Katellea constitue un acte de contrefaçon, sanctionné au titre des articles L.335-2 et L.335.3 du même code.</p>
            <p>Par ailleurs, la marque Katellea est protégée au titre des articles L.712-1 et suivants du code de la propriété intellectuelle. Toute représentation, reproduction ou diffusion, intégrale ou partielle de la marque Katellea, sur quelque support que ce soit, sans l'autorisation expresse et préalable de Katellea constitue un acte de contrefaçon, sanctionné au titre des articles L.716-1 du même code.</p>

            <h2>8. Crédits</h2>
            <p>Les cartes générées utilisent le service <a className="native" href="https://www.openstreetmap.org/">https://www.openstreetmap.org/</a></p>
            <p>Les données des collectes mobiles sont récupérés via <a className="native" href="https://www.data.gouv.fr/fr/datasets/dates-et-lieux-des-collectes-de-don-du-sang/">https://www.data.gouv.fr/fr/datasets/dates-et-lieux-des-collectes-de-don-du-sang/</a></p>

            <h3>9.1 - Crédit des icônes</h3>
            <p>Icons made by <a className="native" href="http://www.freepik.com" title="Freepik">Freepik</a> from <a className="native" href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a className="native" href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank" rel="noopener noreferrer">CC 3.0 BY</a></p>
            <p>Icons made by <a href="https://www.flaticon.com/authors/dimitry-miroliubov" title="Dimitry Miroliubov">Dimitry Miroliubov</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" rel="noopener noreferrer" target="_blank">CC 3.0 BY</a></p>

            <h3>9.2 - Crédit des villes</h3>
            <p>Les coordonnées des villes françaises est issue du site <a href="http://www.bibichette.com/base-de-donnees-des-villes-francaise/">http://www.bibichette.com/base-de-donnees-des-villes-francaise/</a></p>
          </main>
        </div>
      </div>
    );
  }
}
