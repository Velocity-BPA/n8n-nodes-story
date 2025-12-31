/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getStoryClient } from '../../transport';

export const description: INodeProperties[] = [
  {
    displayName: 'IP ID',
    name: 'ipId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The IP Asset ID to claim royalties for',
    displayOptions: {
      show: {
        resource: ['royalty'],
        operation: ['claim'],
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
    description: 'The currency token address to claim',
    displayOptions: {
      show: {
        resource: ['royalty'],
        operation: ['claim'],
      },
    },
  },
  {
    displayName: 'Claimer Address',
    name: 'claimerAddress',
    type: 'string',
    required: false,
    default: '',
    placeholder: '0x...',
    description: 'The address claiming the royalties (defaults to connected wallet)',
    displayOptions: {
      show: {
        resource: ['royalty'],
        operation: ['claim'],
      },
    },
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const ipId = this.getNodeParameter('ipId', index) as string;
  const currencyToken = this.getNodeParameter('currencyToken', index) as string;
  const claimerAddress = this.getNodeParameter('claimerAddress', index, '') as string;

  const storyClient = await getStoryClient(this);

  try {
    const signer = storyClient.getSigner();
    const claimer = claimerAddress || (await signer.getAddress());

    // Call claimRevenue on the StoryClient
    const result = await storyClient.claimRevenue(
      [], // snapshotIds
      ipId, // ipId
      ipId, // ancestorIpId (same for self-claim)
      currencyToken, // token
    );

    return [
      {
        json: {
          success: result.status,
          ipId,
          claimer,
          currencyToken,
          txHash: result.hash,
          blockNumber: result.blockNumber,
          gasUsed: result.gasUsed,
        } as IDataObject,
        pairedItem: { item: index },
      },
    ];
  } catch (error) {
    throw new NodeOperationError(
      this.getNode(),
      `Failed to claim royalties: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
