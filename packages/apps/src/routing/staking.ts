// Copyright 2017-2019 @polkadot/apps authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Routes } from '../types';

import Staking from '@polkadot/app-staking/index';

export default ([
  {
    Component: Staking,
    i18n: {
      defaultValue: 'Staking'
    },
    icon: 'certificate',
    isApiGated: true,
    isHidden: false,
    name: 'staking',
    needsApi: [
      'tx.staking.stake'
    ]
  }
] as Routes);
