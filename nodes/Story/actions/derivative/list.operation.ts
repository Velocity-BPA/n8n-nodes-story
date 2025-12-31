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
    displayName: 'List Type',
    name: 'listType',
    type: 'options',
    options: [
      {
        name: 'Children',
        value: 'children',
        description: 'List direct children of an IP Asset',
      },
      {
        name: 'Parents',
        value: 'parents',
        description: 'List direct parents of an IP Asset',
      },
      {
        name: 'All Derivatives',
        value: 'all',
        description: 'List all derivatives in the system',
      },
    ],
    default: 'children',
    displayOptions: {
      show: {
        resource: ['derivative'],
        operation: ['list'],
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
        resource: ['derivative'],
        operation: ['list'],
        listType: ['children', 'parents'],
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
        resource: ['derivative'],
        operation: ['list'],
      },
    },
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const listType = this.getNodeParameter('listType', index) as string;
  const limit = this.getNodeParameter('limit', index) as number;

  const apiClient = await getStoryApiClient(this);

  try {
    switch (listType) {
      case 'children': {
        const ipId = this.getNodeParameter('ipId', index) as string;
        const children = await apiClient.getChildren(ipId);
        
        return [
          {
            json: {
              ipId,
              type: 'children',
              items: children.slice(0, limit),
              count: children.length,
            },
            pairedItem: { item: index },
          },
        ];
      }

      case 'parents': {
        const ipId = this.getNodeParameter('ipId', index) as string;
        const parents = await apiClient.getParents(ipId);
        
        return [
          {
            json: {
              ipId,
              type: 'parents',
              items: parents.slice(0, limit),
              count: parents.length,
            },
            pairedItem: { item: index },
          },
        ];
      }

      case 'all': {
        const derivatives = await apiClient.getDerivatives({ limit });
        
        return derivatives.map((d) => ({
          json: { ...d } as IDataObject,
          pairedItem: { item: index },
        }));
      }

      default:
        throw new NodeOperationError(this.getNode(), `Unknown list type: ${listType}`);
    }
  } catch (error) {
    throw new NodeOperationError(
      this.getNode(),
      `Failed to list derivatives: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
