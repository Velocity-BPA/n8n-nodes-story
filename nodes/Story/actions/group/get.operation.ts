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
        name: 'Get Group',
        value: 'getGroup',
        description: 'Get a specific group by ID',
      },
      {
        name: 'List Groups',
        value: 'listGroups',
        description: 'List all groups',
      },
      {
        name: 'Get Group IPs',
        value: 'getGroupIPs',
        description: 'Get IP Assets in a group',
      },
    ],
    default: 'getGroup',
    displayOptions: {
      show: {
        resource: ['group'],
        operation: ['get'],
      },
    },
  },
  {
    displayName: 'Group ID',
    name: 'groupId',
    type: 'string',
    required: true,
    default: '',
    description: 'The group ID',
    displayOptions: {
      show: {
        resource: ['group'],
        operation: ['get'],
        getAction: ['getGroup', 'getGroupIPs'],
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
      case 'getGroup': {
        const groupId = this.getNodeParameter('groupId', index) as string;
        const group = await apiClient.getGroup(groupId);
        
        return [
          {
            json: { ...group } as IDataObject,
            pairedItem: { item: index },
          },
        ];
      }

      case 'listGroups': {
        const groups = await apiClient.getGroups();
        
        return groups.map((g) => ({
          json: { ...g } as IDataObject,
          pairedItem: { item: index },
        }));
      }

      case 'getGroupIPs': {
        const groupId = this.getNodeParameter('groupId', index) as string;
        const ips = await apiClient.getGroupIPs(groupId);
        
        return [
          {
            json: {
              groupId,
              ipAssets: ips,
              count: ips.length,
            },
            pairedItem: { item: index },
          },
        ];
      }

      default:
        throw new NodeOperationError(this.getNode(), `Unknown action: ${getAction}`);
    }
  } catch (error) {
    throw new NodeOperationError(
      this.getNode(),
      `Failed to get group: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
