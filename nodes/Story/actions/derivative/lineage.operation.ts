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
    displayName: 'IP ID',
    name: 'ipId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The IP Asset ID to get lineage for',
    displayOptions: {
      show: {
        resource: ['derivative'],
        operation: ['lineage'],
      },
    },
  },
  {
    displayName: 'Direction',
    name: 'direction',
    type: 'options',
    options: [
      {
        name: 'Both',
        value: 'both',
        description: 'Get both ancestors and descendants',
      },
      {
        name: 'Ancestors Only',
        value: 'ancestors',
        description: 'Get only ancestors (parents, grandparents, etc.)',
      },
      {
        name: 'Descendants Only',
        value: 'descendants',
        description: 'Get only descendants (children, grandchildren, etc.)',
      },
    ],
    default: 'both',
    displayOptions: {
      show: {
        resource: ['derivative'],
        operation: ['lineage'],
      },
    },
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const ipId = this.getNodeParameter('ipId', index) as string;
  const direction = this.getNodeParameter('direction', index) as string;

  const apiClient = await getStoryApiClient(this);

  try {
    const lineage = await apiClient.getLineage(ipId);

    const result: Record<string, unknown> = {
      ipId,
    };

    if (direction === 'both' || direction === 'ancestors') {
      result.ancestors = lineage.ancestors;
      result.ancestorCount = lineage.ancestors.length;
    }

    if (direction === 'both' || direction === 'descendants') {
      result.descendants = lineage.descendants;
      result.descendantCount = lineage.descendants.length;
    }

    if (direction === 'both') {
      result.tree = lineage.tree;
    }

    return [
      {
        json: result as IDataObject,
        pairedItem: { item: index },
      },
    ];
  } catch (error) {
    throw new NodeOperationError(
      this.getNode(),
      `Failed to get lineage: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
