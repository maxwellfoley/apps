// Copyright 2017-2019 @polkadot/apps authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SemanticICONS } from 'semantic-ui-react/dist/commonjs';
import { AppProps, BareProps } from '@polkadot/ui-app/types';

export type RouteProps = AppProps & BareProps;

export type Route = {
  Component: React.ComponentType<RouteProps>,
  i18n: any, // I18Next$Translate$Config,
  icon: SemanticICONS,
  isApiGated: boolean,
  isHidden: boolean,
  name: string,
  needsApi?: Array<string>
};

export type Routes = Array<Route | null>;

export type Routing = {
  default: string,
  routes: Routes
};
