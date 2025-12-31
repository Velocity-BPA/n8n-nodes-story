/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getStoryApiClient } from '../../transport';

export const description: INodeProperties[] = [
  {
    displayName: 'IP ID',
    name: 'ipId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The IP Asset ID',
    displayOptions: {
      show: {
        resource: ['license'],
        operation: ['verify'],
      },
    },
  },
  {
    displayName: 'License Terms ID',
    name: 'licenseTermsId',
    type: 'number',
    required: true,
    default: 1,
    description: 'The license terms ID to verify',
    displayOptions: {
      show: {
        resource: ['license'],
        operation: ['verify'],
      },
    },
  },
  {
    displayName: 'Holder Address',
    name: 'holder',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The address to verify as license holder',
    displayOptions: {
      show: {
        resource: ['license'],
        operation: ['verify'],
      },
    },
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const ipId = this.getNodeParameter('ipId', index) as string;
  const licenseTermsId = this.getNodeParameter('licenseTermsId', index) as number;
  const holder = this.getNodeParameter('holder', index) as string;

  const apiClient = await getStoryApiClient(this);

  try {
    const result = await apiClient.verifyLicense(ipId, licenseTermsId, holder);

    return [
      {
        json: {
          ipId,
          licenseTermsId,
          holder,
          valid: result.valid,
          reason: result.reason || (result.valid ? 'License is valid' : 'License verification failed'),
        },
        pairedItem: { item: index },
      },
    ];
  } catch (error) {
    throw new NodeOperationError(
      this.getNode(),
      `Failed to verify license: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
