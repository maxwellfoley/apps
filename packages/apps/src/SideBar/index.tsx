// Copyright 2017-2019 @polkadot/apps authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';

import './SideBar.css';

import React from 'react';
import { Icon, Menu } from '@polkadot/ui-app/index';
import polkadotLogo from '@polkadot/ui-assets/polkadot-white.svg';
import substrateLogo from '@polkadot/ui-assets/parity-substrate-white.svg';
import settings from '@polkadot/ui-settings';

import routing from '../routing';
import translate from '../translate';
import Item from './Item';

type Props = I18nProps & {
  children?: React.ReactNode
};

const LOGOS: Map<string | undefined, any> = new Map([
  ['polkadot', polkadotLogo],
  ['substrate', substrateLogo]
]);

const LOGO = LOGOS.get(settings.uiTheme) || polkadotLogo;

class SideBar extends React.PureComponent<Props> {
  render () {
    const { children } = this.props;

    return (
      <div className='apps--SideBar'>
        <Menu
          secondary
          vertical
        >
          {this.renderLogo()}
          {this.renderRoutes()}
          <Menu.Divider hidden />
          {this.renderGithub()}
          {this.renderWiki()}
          <Menu.Divider hidden />
          {children}
        </Menu>
      </div>
    );
  }

  private renderLogo () {
    return (
      <img
        alt='polkadot'
        className='apps--SideBar-logo'
        src={LOGO}
      />
    );
  }

  private renderRoutes () {
    const { t } = this.props;

    return routing.routes
      .filter((route) =>
        !route || !route.isHidden
      )
      .map((route, index) => (
        route
          ? (
            <Item
              key={route.name}
              t={t}
              route={route}
            />
          )
          : (
            <Menu.Divider
              hidden
              key={index}
            />
          )
      ));
  }

  private renderGithub () {
    return (
      <Menu.Item className='apps--SideBar-Item'>
        <a
          className='apps--SideBar-Item-NavLink'
          href='https://github.com/polkadot-js/apps'
        >
          <Icon name='github' /> GitHub
        </a>
      </Menu.Item>
    );
  }

  private renderWiki () {
    return null;

    // disabled for now, we need the space
    // return (
    //   <Menu.Item className='apps--SideBar-Item'>
    //     <a
    //       className='apps--SideBar-Item-NavLink'
    //       href='https://github.com/w3f/Web3-wiki/wiki/Polkadot'
    //     >
    //       <Icon name='book' /> Wiki
    //     </a>
    //   </Menu.Item>
    // );
  }
}

export default translate(SideBar);
