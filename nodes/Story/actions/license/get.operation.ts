/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getStoryApiClient, LicenseResponse } from '../../transport';

export const description: INodeProperties[] = [
  {
    displayName: 'Get Action',
    name: 'getAction',
    type: 'options',
    options: [
      {
        name: 'Get License',
        value: 'getLicense',
        description: 'Get license information by IP ID and terms ID',
      },
      {
        name: 'Get License Token',
        value: 'getToken',
        description: 'Get license token by token ID',
      },
      {
        name: 'List Licenses',
        value: 'listLicenses',
        description: 'List all licenses for an IP Asset',
      },
      {
        name: 'Get Licensees',
        value: 'getLicensees',
        description: 'Get licensees for an IP Asset',
      },
    ],
    default: 'getLicense',
    displayOptions: {
      show: {
        resource: ['license'],
        operation: ['get'],
      },
    },
  },
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
        operation: ['get'],
        getAction: ['getLicense', 'listLicenses', 'getLicensees'],
      },
    },
  },
  {
    displayName: 'License Terms ID',
    name: 'licenseTermsId',
    type: 'number',
    required: true,
    default: 1,
    description: 'The license terms ID',
    displayOptions: {
      show: {
        resource: ['license'],
        operation: ['get'],
        getAction: ['getLicense'],
      },
    },
  },
  {
    displayName: 'Token ID',
    name: 'tokenId',
    type: 'string',
    required: true,
    default: '',
    description: 'The license token ID',
    displayOptions: {
      show: {
        resource: ['license'],
        operation: ['get'],
        getAction: ['getToken'],
      },
    },
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['license'],
        operation: ['get'],
        getAction: ['listLicenses', 'getLicensees'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    typeOptions: {
      minValue: 1,
      maxValue: 100,
    },
    default: 50,
    description: 'Max number of results to return',
    displayOptions: {
      show: {
        resource: ['license'],
        operation: ['get'],
        getAction: ['listLicenses', 'getLicensees'],
        returnAll: [false],
      },
    },
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const getAction = this.getNodeParameter('getAction', index) as string;
  const apiClient = await getStoryApiClient(this);

  try {
    switch (getAction) {
      case 'getLicense': {
        const ipId = this.getNodeParameter('ipId', index) as string;
        const licenseTermsId = this.getNodeParameter('licenseTermsId', index) as number;
        const license = await apiClient.getLicense(ipId, licenseTermsId);

        return [
          {
            json: { ...license } as IDataObject,
            pairedItem: { item: index },
          },
        ];
      }

      case 'getToken': {
        const tokenId = this.getNodeParameter('tokenId', index) as string;
        const licenseToken = await apiClient.getLicenseToken(tokenId);

        return [
          {
            json: { ...licenseToken } as IDataObject,
            pairedItem: { item: index },
          },
        ];
      }

      case 'listLicenses': {
        const ipId = this.getNodeParameter('ipId', index) as string;
        const returnAll = this.getNodeParameter('returnAll', index) as boolean;
        const limit = returnAll ? 1000 : (this.getNodeParameter('limit', index) as number);
        
        const licenses = await apiClient.getIPAssetLicenses(ipId, { limit });

        return licenses.map((license: LicenseResponse) => ({
          json: { ...license } as IDataObject,
          pairedItem: { item: index },
        }));
      }

      case 'getLicensees': {
        const ipId = this.getNodeParameter('ipId', index) as string;
        const licensees = await apiClient.getLicensees(ipId);

        return [
          {
            json: {
              ipId,
              licensees,
              count: licensees.length,
            },
            pairedItem: { item: index },
          },
        ];
      }

      default:
        throw new NodeOperationError(this.getNode(), `Unknown get action: ${getAction}`);
    }
  } catch (error) {
    throw new NodeOperationError(
      this.getNode(),
      `License get operation failed: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
