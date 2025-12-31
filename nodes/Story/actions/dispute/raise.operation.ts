/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getStoryClient } from '../../transport';

export const description: INodeProperties[] = [
  {
    displayName: 'Target IP ID',
    name: 'targetIpId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The IP Asset ID being disputed',
    displayOptions: {
      show: {
        resource: ['dispute'],
        operation: ['raise'],
      },
    },
  },
  {
    displayName: 'Evidence Link',
    name: 'evidenceLink',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'https://...',
    description: 'Link to dispute evidence',
    displayOptions: {
      show: {
        resource: ['dispute'],
        operation: ['raise'],
      },
    },
  },
  {
    displayName: 'Dispute Tag',
    name: 'targetTag',
    type: 'string',
    required: true,
    default: 'PLAGIARISM',
    description: 'Tag describing the dispute type',
    displayOptions: {
      show: {
        resource: ['dispute'],
        operation: ['raise'],
      },
    },
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const targetIpId = this.getNodeParameter('targetIpId', index) as string;
  const evidenceLink = this.getNodeParameter('evidenceLink', index) as string;
  const targetTag = this.getNodeParameter('targetTag', index) as string;

  const client = await getStoryClient(this);

  try {
    const result = await client.raiseDispute(targetIpId, evidenceLink, targetTag);

    return [
      {
        json: {
          success: result.status,
          targetIpId,
          evidenceLink,
          targetTag,
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
      `Failed to raise dispute: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
