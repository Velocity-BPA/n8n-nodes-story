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
    displayName: 'Child IP ID',
    name: 'childIpId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The IP Asset ID of the derivative work',
    displayOptions: {
      show: {
        resource: ['derivative'],
        operation: ['link'],
      },
    },
  },
  {
    displayName: 'License Token IDs',
    name: 'licenseTokenIds',
    type: 'string',
    required: true,
    default: '',
    placeholder: '1, 2, 3',
    description: 'Comma-separated list of license token IDs to use for linking',
    displayOptions: {
      show: {
        resource: ['derivative'],
        operation: ['link'],
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
        resource: ['derivative'],
        operation: ['link'],
      },
    },
    options: [
      {
        displayName: 'Royalty Context',
        name: 'royaltyContext',
        type: 'string',
        default: '0x',
        description: 'Additional royalty context data',
      },
    ],
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const childIpId = this.getNodeParameter('childIpId', index) as string;
  const licenseTokenIdsStr = this.getNodeParameter('licenseTokenIds', index) as string;
  const options = this.getNodeParameter('options', index, {}) as { royaltyContext?: string };

  // Parse license token IDs
  const licenseTokenIds = licenseTokenIdsStr.split(',').map((id) => parseInt(id.trim(), 10));

  // Validate inputs
  if (!StoryClient.isValidAddress(childIpId)) {
    throw new NodeOperationError(this.getNode(), `Invalid child IP ID: ${childIpId}`, {
      itemIndex: index,
    });
  }

  if (licenseTokenIds.length === 0) {
    throw new NodeOperationError(this.getNode(), 'At least one license token ID is required', {
      itemIndex: index,
    });
  }

  const client = await getStoryClient(this);
  const royaltyContext = options.royaltyContext || '0x';

  try {
    const result = await client.registerDerivativeWithLicenseTokens(
      childIpId,
      licenseTokenIds,
      royaltyContext,
    );

    return [
      {
        json: {
          success: result.status,
          childIpId,
          licenseTokenIds,
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
      `Failed to link derivative: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
