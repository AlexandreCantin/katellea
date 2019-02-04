import React, { Component } from 'react';
import { Link } from '@reach/router';
import PropTypes from 'prop-types';
import cx from 'classnames';

import store from '../../services/store';

/*
Sources :
  - https://github.com/scottaohara/a11y_breadcrumbs
  - https://developers.google.com/search/docs/data-types/breadcrumb
  - https://schema.org/BreadcrumbList
*/

require('./breadcrumb.scss');

export default class Breadcrumb extends Component {
  static defaultProps = { links: [] };
  static propTypes = { links: PropTypes.array }

  constructor(props) {
    super(props);

    const hasUser = store.getState().user.id;

    let links = this.props.links;

    if(links.length === 0) {
      links = this.addFirstBreadcumbLink(links, hasUser);
    } else if(links[0] && links[0].href !== '/tableau-de-bord' && links[0].href !== '/') {
      links = this.addFirstBreadcumbLink(links, hasUser);
    }

    this.state = { links, hasUser };
  }

  addFirstBreadcumbLink(links, hasUser) {
    if (hasUser) links.unshift({ href: '/tableau-de-bord', text: 'Tableau de bord' });
    else links.unshift({ href: '/', text: 'Accueil du site' });

    return links;
  }

  render() {
    const { links, hasUser } = this.state;

    return (
      <nav className={cx('breadcrumb-nav', { 'has-user': hasUser })} aria-label="breadcrumb" itemScope itemType="http://schema.org/BreadcrumbList">
        <ol className="inline-list list-unstyled">
          {
            links.map((el, index) => {
              const last = index === links.length - 1;

              return (
                <li key={el.href} itemProp="itemListElement" itemScope itemType="http://schema.org/ListItem">
                  <Link to={el.href} title={'Aller à la page : ' + el.text} aria-current={last ? 'page' : false}>
                    {index === 0 ? <img src="/icons/home.svg" alt="" /> : null}
                    <span itemProp="name">{el.text}</span>
                  </Link>
                </li>
              );
            })
          }
        </ol>
      </nav>
    );
  }
}