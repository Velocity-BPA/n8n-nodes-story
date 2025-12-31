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
    displayName: 'Licensor IP ID',
    name: 'licensorIpId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The IP Asset ID of the licensor',
    displayOptions: {
      show: {
        resource: ['license'],
        operation: ['mint'],
      },
    },
  },
  {
    displayName: 'License Terms ID',
    name: 'licenseTermsId',
    type: 'number',
    required: true,
    default: 1,
    description: 'The ID of the license terms to mint tokens for',
    displayOptions: {
      show: {
        resource: ['license'],
        operation: ['mint'],
      },
    },
  },
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'number',
    required: true,
    default: 1,
    typeOptions: {
      minValue: 1,
    },
    description: 'Number of license tokens to mint',
    displayOptions: {
      show: {
        resource: ['license'],
        operation: ['mint'],
      },
    },
  },
  {
    displayName: 'Receiver',
    name: 'receiver',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'Address to receive the license tokens',
    displayOptions: {
      show: {
        resource: ['license'],
        operation: ['mint'],
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
        operation: ['mint'],
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
  const licensorIpId = this.getNodeParameter('licensorIpId', index) as string;
  const licenseTermsId = this.getNodeParameter('licenseTermsId', index) as number;
  const amount = this.getNodeParameter('amount', index) as number;
  const receiver = this.getNodeParameter('receiver', index) as string;
  const options = this.getNodeParameter('options', index, {}) as {
    licenseTemplate?: string;
    royaltyContext?: string;
  };

  // Validate addresses
  if (!StoryClient.isValidAddress(licensorIpId)) {
    throw new NodeOperationError(this.getNode(), `Invalid licensor IP ID: ${licensorIpId}`, {
      itemIndex: index,
    });
  }

  if (!StoryClient.isValidAddress(receiver)) {
    throw new NodeOperationError(this.getNode(), `Invalid receiver address: ${receiver}`, {
      itemIndex: index,
    });
  }

  const client = await getStoryClient(this);
  const credentials = await this.getCredentials('storyProtocol');
  const network = credentials.network as NetworkId;
  const addresses = getContractAddresses(network);

  const licenseTemplate = options.licenseTemplate || addresses.pilTemplate;
  const royaltyContext = options.royaltyContext || '0x';

  try {
    const result = await client.mintLicenseTokens(
      licensorIpId,
      licenseTemplate,
      licenseTermsId,
      amount,
      receiver,
      royaltyContext,
    );

    // Extract start license token ID from events
    let startLicenseTokenId = '';
    const mintEvent = result.events.find((e) => e.name === 'LicenseTokensMinted');
    if (mintEvent && mintEvent.args['startLicenseTokenId']) {
      startLicenseTokenId = mintEvent.args['startLicenseTokenId'] as string;
    }

    return [
      {
        json: {
          success: result.status,
          licensorIpId,
          licenseTemplate,
          licenseTermsId,
          amount,
          receiver,
          startLicenseTokenId,
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
      `Failed to mint license tokens: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
