// Copyright 2017-2019 @polkadot/app-extrinsics authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Props } from '@polkadot/ui-params/types';

import React from 'react';
import keyring from '@polkadot/ui-keyring';

import BaseAccount from '../Account';

export default class Account extends React.PureComponent<Props> {
  render () {
    const { className, defaultValue: { value }, isDisabled, isError, label, style, withLabel } = this.props;
    const defaultValue = (value as string);

    return (
      <BaseAccount
        className={className}
        defaultValue={defaultValue}
        isDisabled={isDisabled}
        isError={isError}
        isInput
        label={label}
        onChange={this.onChange}
        style={style}
        withLabel={withLabel}
      />
    );
  }

  onChange = (value: string): void => {
    const { onChange } = this.props;

    let isValid = false;

    try {
      keyring.decodeAddress(value);

      isValid = true;
    } catch (err) {
      console.error(err);
    }

    onChange && onChange({
      isValid,
      value
    });
  }
}
