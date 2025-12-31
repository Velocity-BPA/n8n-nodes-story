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
    displayName: 'Token Contract',
    name: 'tokenContract',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The address of the NFT contract that holds the token',
    displayOptions: {
      show: {
        resource: ['ipAsset'],
        operation: ['register'],
      },
    },
  },
  {
    displayName: 'Token ID',
    name: 'tokenId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '1',
    description: 'The ID of the token to register as an IP Asset',
    displayOptions: {
      show: {
        resource: ['ipAsset'],
        operation: ['register'],
      },
    },
  },
  {
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['ipAsset'],
        operation: ['register'],
      },
    },
    options: [
      {
        displayName: 'Chain ID',
        name: 'chainId',
        type: 'number',
        default: 0,
        description: 'Override the chain ID (uses network default if not specified)',
      },
    ],
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const tokenContract = this.getNodeParameter('tokenContract', index) as string;
  const tokenId = this.getNodeParameter('tokenId', index) as string;
  const options = this.getNodeParameter('options', index, {}) as { chainId?: number };

  // Validate inputs
  if (!StoryClient.isValidAddress(tokenContract)) {
    throw new NodeOperationError(
      this.getNode(),
      `Invalid token contract address: ${tokenContract}`,
      { itemIndex: index },
    );
  }

  const client = await getStoryClient(this);

  try {
    const result = await client.registerIpAsset(tokenContract, tokenId, options.chainId);

    // Extract IP ID from events
    let ipId = '';
    const registeredEvent = result.events.find((e) => e.name === 'IPRegistered');
    if (registeredEvent && registeredEvent.args['ipId']) {
      ipId = registeredEvent.args['ipId'] as string;
    }

    return [
      {
        json: {
          success: result.status,
          ipId,
          tokenContract,
          tokenId,
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
      `Failed to register IP Asset: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
