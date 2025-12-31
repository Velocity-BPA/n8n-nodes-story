/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getStoryClient, StoryClient } from '../../transport';
import { getContractAddresses, NetworkId } from '../../constants';

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
        operation: ['register'],
      },
    },
  },
  {
    displayName: 'Parent IP IDs',
    name: 'parentIpIds',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x..., 0x...',
    description: 'Comma-separated list of parent IP Asset IDs',
    displayOptions: {
      show: {
        resource: ['derivative'],
        operation: ['register'],
      },
    },
  },
  {
    displayName: 'License Terms IDs',
    name: 'licenseTermsIds',
    type: 'string',
    required: true,
    default: '',
    placeholder: '1, 2',
    description: 'Comma-separated list of license terms IDs (must match parent IPs order)',
    displayOptions: {
      show: {
        resource: ['derivative'],
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
        resource: ['derivative'],
        operation: ['register'],
      },
    },
    options: [
      {
        displayName: 'License Template',
        name: 'licenseTemplate',
        type: 'string',
        default: '',
        placeholder: '0x...',
        description: 'Custom license template address',
      },
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
  const parentIpIdsStr = this.getNodeParameter('parentIpIds', index) as string;
  const licenseTermsIdsStr = this.getNodeParameter('licenseTermsIds', index) as string;
  const options = this.getNodeParameter('options', index, {}) as {
    licenseTemplate?: string;
    royaltyContext?: string;
  };

  // Parse arrays
  const parentIpIds = parentIpIdsStr.split(',').map((id) => id.trim());
  const licenseTermsIds = licenseTermsIdsStr.split(',').map((id) => parseInt(id.trim(), 10));

  // Validate inputs
  if (!StoryClient.isValidAddress(childIpId)) {
    throw new NodeOperationError(this.getNode(), `Invalid child IP ID: ${childIpId}`, {
      itemIndex: index,
    });
  }

  for (const parentId of parentIpIds) {
    if (!StoryClient.isValidAddress(parentId)) {
      throw new NodeOperationError(this.getNode(), `Invalid parent IP ID: ${parentId}`, {
        itemIndex: index,
      });
    }
  }

  if (parentIpIds.length !== licenseTermsIds.length) {
    throw new NodeOperationError(
      this.getNode(),
      'Number of parent IPs must match number of license terms IDs',
      { itemIndex: index },
    );
  }

  const client = await getStoryClient(this);
  const credentials = await this.getCredentials('storyProtocol');
  const network = credentials.network as NetworkId;
  const addresses = getContractAddresses(network);

  const licenseTemplate = options.licenseTemplate || addresses.pilTemplate;
  const royaltyContext = options.royaltyContext || '0x';

  try {
    const result = await client.registerDerivative(
      childIpId,
      parentIpIds,
      licenseTermsIds,
      licenseTemplate,
      royaltyContext,
    );

    return [
      {
        json: {
          success: result.status,
          childIpId,
          parentIpIds,
          licenseTermsIds,
          licenseTemplate,
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
      `Failed to register derivative: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
