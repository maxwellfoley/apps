// Copyright 2017-2019 @polkadot/ui-app authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { RpcMethod } from '@polkadot/jsonrpc/types';
import { BareProps } from '../types';
import { ActionStatus, PartialQueueTx$Extrinsic, PartialQueueTx$Rpc, QueueProps, QueueStatus, QueueTx, QueueTx$Extrinsic, QueueTx$Rpc, QueueTx$Status } from './types';

import React from 'react';
import jsonrpc from '@polkadot/jsonrpc';

import { QueueProvider } from './Context';
import { SubmittableSendResult } from '@polkadot/api/types';

export type Props = BareProps & {
  children: React.ReactNode
};

type State = QueueProps;

const defaultState = {
  stqueue: [] as Array<QueueStatus>,
  txqueue: [] as Array<QueueTx>
} as QueueProps;

let nextId = 0;

const MAX_TRANSACTION_SIZE = 10 * 24 * 24;
const REMOVE_TIMEOUT = 7500;
const SUBMIT_RPC = jsonrpc.author.methods.submitAndWatchExtrinsic;
const STATUS_COMPLETE: Array<QueueTx$Status> = [
  // status from subscription
  'finalised', 'usurped', 'dropped', 'invalid',
  // normal completion
  'cancelled', 'error', 'sent'
];

export default class Queue extends React.Component<Props, State> {
  state: State = defaultState;

  constructor (props: Props) {
    super(props);

    this.state = {
      stqueue: [],
      txqueue: [],
      queueAction: this.queueAction,
      queueRpc: this.queueRpc,
      queueExtrinsic: this.queueExtrinsic,
      queueSetTxStatus: this.queueSetTxStatus
    };
  }

  render () {
    return (
      <QueueProvider value={this.state}>
        {this.props.children}
      </QueueProvider>
    );
  }

  queueAction = (status: ActionStatus): number => {
    const id = ++nextId;

    this.setState(
      (prevState: State): State => ({
        stqueue: prevState.stqueue.concat({
          ...status,
          id,
          isCompleted: false
        })
      } as State)
    );

    setTimeout(() => {
      this.setState(
        (prevState: State): State => ({
          stqueue: prevState.stqueue.filter((item) => item.id !== id)
        } as State)
      );
    }, REMOVE_TIMEOUT);

    return id;
  }

  queueSetTxStatus = (id: number, status: QueueTx$Status, result?: SubmittableSendResult, error?: Error): void => {
    this.setState(
      (prevState: State): State => ({
        txqueue: prevState.txqueue.map((item) =>
          item.id === id
            ? {
              ...item,
              error: error === undefined
                ? item.error
                : error,
              result: result === undefined
                ? item.result
                : result,
              status: item.status === 'completed'
                ? item.status
                : status
            }
            : item
        )
      } as State)
    );

    this.addResultEvents(result);

    if (STATUS_COMPLETE.includes(status)) {
      setTimeout(() => {
        this.setState(
          (prevState: State): State => ({
            txqueue: prevState.txqueue.map((item) =>
              item.id === id
                ? { ...item, status: 'completed' }
                : item
            )
          } as State)
        );
      }, REMOVE_TIMEOUT);
    }
  }

  private addResultEvents ({ events = [] }: Partial<SubmittableSendResult> = {}) {
    events.filter((record) => record.event).forEach(({ event: { method, section } }) => {
      // filter events handled globally, or those we are not interested in
      // NOTE We are not splitting balances, since we want to see the transfer - even if
      // it doubles-up for own accounts (one with id, one without)
      if ((section === 'democracy') || (section === 'system')) {
        return;
      }

      this.queueAction({
        action: `${section}.${method}`,
        status: 'event',
        message: 'extrinsic event'
      });
    });
  }

  private estimateTransactionSize(params: Array<any>) {
    let bytesTotal = 0;
    for(var i = 0; i < params.length; i++) {
      if(typeof params[i] === 'boolean') {
        bytesTotal += 4;
      } else if(typeof params[i] === 'number') {
        bytesTotal += 8;
      } else if(typeof params[i] === 'string') {
        // 2B per string character
        bytesTotal += params[i].length * 2;
        // get accurate count of size of typed arrays
      } else if(params[i].byteLength != undefined) {
        bytesTotal += params[i].byteLength;
      } else {
        // if none of the above, estimate by converting to JSON
        bytesTotal += JSON.stringify(params[i]).length * 2;
      }
    }
    return bytesTotal;
  }

  private queueAdd = (value: QueueTx$Extrinsic | QueueTx$Rpc | QueueTx): number => {
    const id = ++nextId;
    const rpc: RpcMethod = (value as QueueTx$Rpc).rpc || SUBMIT_RPC;
    
    // check to see if the data we are passing to the RPC is more than 10MB in length
    // 2B per string character
    if(this.estimateTransactionSize((value as QueueTx$Rpc).values) >= MAX_TRANSACTION_SIZE) {
      this.queueAction({
        action: `${rpc.section}.${rpc.method}`,
        status: 'error',
        message: 'Warning: This transaction will likely be rejected by the network as it is greater \
                  than the maximum size of ' + MAX_TRANSACTION_SIZE / (24 * 24) + 'MB'
      });
    }

    this.setState(
      (prevState: State): State => ({
        txqueue: prevState.txqueue.concat([{
          ...value,
          id,
          rpc,
          status: 'queued'
        }])
      } as State)
    );

    return id;
  }

  queueExtrinsic = ({ accountId, extrinsic, isUnsigned }: PartialQueueTx$Extrinsic): number => {
    return this.queueAdd({
      accountId,
      extrinsic,
      isUnsigned
    });
  }

  queueRpc = ({ accountId, rpc, values }: PartialQueueTx$Rpc): number => {
    return this.queueAdd({
      accountId,
      rpc,
      values
    });
  }
}
