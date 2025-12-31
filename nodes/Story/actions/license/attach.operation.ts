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
    displayName: 'IP ID',
    name: 'ipId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The IP Asset ID to attach license terms to',
    displayOptions: {
      show: {
        resource: ['license'],
        operation: ['attach'],
      },
    },
  },
  {
    displayName: 'License Terms ID',
    name: 'licenseTermsId',
    type: 'number',
    required: true,
    default: 1,
    description: 'The ID of the PIL license terms to attach',
    displayOptions: {
      show: {
        resource: ['license'],
        operation: ['attach'],
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
        resource: ['license'],
        operation: ['attach'],
      },
    },
    options: [
      {
        displayName: 'License Template',
        name: 'licenseTemplate',
        type: 'string',
        default: '',
        placeholder: '0x...',
        description: 'Custom license template address (uses PIL template by default)',
      },
    ],
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const ipId = this.getNodeParameter('ipId', index) as string;
  const licenseTermsId = this.getNodeParameter('licenseTermsId', index) as number;
  const options = this.getNodeParameter('options', index, {}) as { licenseTemplate?: string };

  // Validate inputs
  if (!StoryClient.isValidAddress(ipId)) {
    throw new NodeOperationError(this.getNode(), `Invalid IP ID: ${ipId}`, {
      itemIndex: index,
    });
  }

  const client = await getStoryClient(this);
  const credentials = await this.getCredentials('storyProtocol');
  const network = credentials.network as NetworkId;
  const addresses = getContractAddresses(network);

  const licenseTemplate = options.licenseTemplate || addresses.pilTemplate;

  try {
    const result = await client.attachLicenseTerms(ipId, licenseTemplate, licenseTermsId);

    return [
      {
        json: {
          success: result.status,
          ipId,
          licenseTemplate,
          licenseTermsId,
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
      `Failed to attach license terms: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
