/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getStoryClient, StoryClient } from '../../transport';

export const description: INodeProperties[] = [
  {
    displayName: 'Receiver IP ID',
    name: 'receiverIpId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The IP Asset ID to receive the royalty payment',
    displayOptions: {
      show: {
        resource: ['royalty'],
        operation: ['pay'],
      },
    },
  },
  {
    displayName: 'Payer IP ID',
    name: 'payerIpId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The IP Asset ID making the royalty payment',
    displayOptions: {
      show: {
        resource: ['royalty'],
        operation: ['pay'],
      },
    },
  },
  {
    displayName: 'Currency Token',
    name: 'currencyToken',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The currency token address to pay with',
    displayOptions: {
      show: {
        resource: ['royalty'],
        operation: ['pay'],
      },
    },
  },
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'string',
    required: true,
    default: '',
    placeholder: '1000000000000000000',
    description: 'Amount to pay (in wei)',
    displayOptions: {
      show: {
        resource: ['royalty'],
        operation: ['pay'],
      },
    },
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const receiverIpId = this.getNodeParameter('receiverIpId', index) as string;
  const payerIpId = this.getNodeParameter('payerIpId', index) as string;
  const currencyToken = this.getNodeParameter('currencyToken', index) as string;
  const amount = this.getNodeParameter('amount', index) as string;

  // Validate inputs
  if (!StoryClient.isValidAddress(receiverIpId)) {
    throw new NodeOperationError(this.getNode(), `Invalid receiver IP ID: ${receiverIpId}`, {
      itemIndex: index,
    });
  }

  if (!StoryClient.isValidAddress(payerIpId)) {
    throw new NodeOperationError(this.getNode(), `Invalid payer IP ID: ${payerIpId}`, {
      itemIndex: index,
    });
  }

  if (!StoryClient.isValidAddress(currencyToken)) {
    throw new NodeOperationError(this.getNode(), `Invalid currency token: ${currencyToken}`, {
      itemIndex: index,
    });
  }

  if (!amount || isNaN(Number(amount)) || BigInt(amount) <= 0n) {
    throw new NodeOperationError(this.getNode(), `Invalid amount: ${amount}`, {
      itemIndex: index,
    });
  }

  const client = await getStoryClient(this);

  try {
    const result = await client.payRoyalty(receiverIpId, payerIpId, currencyToken, amount);

    return [
      {
        json: {
          success: result.status,
          receiverIpId,
          payerIpId,
          currencyToken,
          amount,
          transactionHash: result.hash,
          blockNumber: result.blockNumber,
          gasUsed: result.gasUsed,
          events: result.events,
        },
        pairedItem: { item: index },
      },
    ];
  } catch (error) {
    throw new NodeOperationError(
      this.getNode(),
      `Failed to pay royalty: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
