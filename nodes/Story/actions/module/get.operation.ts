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
        name: 'Get Module',
        value: 'getModule',
        description: 'Get a specific module by address',
      },
      {
        name: 'List Modules',
        value: 'listModules',
        description: 'List all registered modules',
      },
    ],
    default: 'listModules',
    displayOptions: {
      show: {
        resource: ['module'],
        operation: ['get'],
      },
    },
  },
  {
    displayName: 'Module Address',
    name: 'moduleAddress',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The module contract address',
    displayOptions: {
      show: {
        resource: ['module'],
        operation: ['get'],
        getAction: ['getModule'],
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
      case 'getModule': {
        const moduleAddress = this.getNodeParameter('moduleAddress', index) as string;
        const module = await apiClient.getModule(moduleAddress);
        
        return [
          {
            json: { ...module } as IDataObject,
            pairedItem: { item: index },
          },
        ];
      }

      case 'listModules': {
        const modules = await apiClient.getModules();
        
        return modules.map((m) => ({
          json: { ...m } as IDataObject,
          pairedItem: { item: index },
        }));
      }

      default:
        throw new NodeOperationError(this.getNode(), `Unknown action: ${getAction}`);
    }
  } catch (error) {
    throw new NodeOperationError(
      this.getNode(),
      `Failed to get module: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
