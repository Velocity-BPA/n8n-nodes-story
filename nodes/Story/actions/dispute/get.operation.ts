/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getStoryApiClient } from '../../transport';

export const description: INodeProperties[] = [
  {
    displayName: 'Action',
    name: 'getAction',
    type: 'options',
    options: [
      {
        name: 'Get Dispute',
        value: 'getDispute',
        description: 'Get a specific dispute by ID',
      },
      {
        name: 'List Disputes',
        value: 'listDisputes',
        description: 'List disputes with filters',
      },
    ],
    default: 'getDispute',
    displayOptions: {
      show: {
        resource: ['dispute'],
        operation: ['get'],
      },
    },
  },
  {
    displayName: 'Dispute ID',
    name: 'disputeId',
    type: 'string',
    required: true,
    default: '',
    description: 'The dispute ID',
    displayOptions: {
      show: {
        resource: ['dispute'],
        operation: ['get'],
        getAction: ['getDispute'],
      },
    },
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['dispute'],
        operation: ['get'],
        getAction: ['listDisputes'],
      },
    },
    options: [
      {
        displayName: 'Target IP ID',
        name: 'targetIpId',
        type: 'string',
        default: '',
        description: 'Filter by target IP Asset',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'Pending', value: 'PENDING' },
          { name: 'Resolved', value: 'RESOLVED' },
          { name: 'Cancelled', value: 'CANCELLED' },
        ],
        default: 'PENDING',
        description: 'Filter by dispute status',
      },
    ],
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
      case 'getDispute': {
        const disputeId = this.getNodeParameter('disputeId', index) as string;
        const dispute = await apiClient.getDispute(disputeId);
        
        return [
          {
            json: { ...dispute } as IDataObject,
            pairedItem: { item: index },
          },
        ];
      }

      case 'listDisputes': {
        const filters = this.getNodeParameter('filters', index, {}) as Record<string, unknown>;
        const disputes = await apiClient.getDisputes(filters);
        
        return disputes.map((d) => ({
          json: { ...d } as IDataObject,
          pairedItem: { item: index },
        }));
      }

      default:
        throw new NodeOperationError(this.getNode(), `Unknown action: ${getAction}`);
    }
  } catch (error) {
    throw new NodeOperationError(
      this.getNode(),
      `Failed to get disputes: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
