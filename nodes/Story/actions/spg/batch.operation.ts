/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getStoryClient } from '../../transport';

export const description: INodeProperties[] = [
  {
    displayName: 'Batch Action',
    name: 'batchAction',
    type: 'options',
    options: [
      {
        name: 'Batch Register',
        value: 'batchRegister',
        description: 'Register multiple IP Assets in one transaction',
      },
      {
        name: 'Batch Mint and Register',
        value: 'batchMintRegister',
        description: 'Mint and register multiple IP Assets',
      },
    ],
    default: 'batchRegister',
    displayOptions: {
      show: {
        resource: ['spg'],
        operation: ['batch'],
      },
    },
  },
  {
    displayName: 'NFT Contract',
    name: 'nftContract',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The NFT collection contract address',
    displayOptions: {
      show: {
        resource: ['spg'],
        operation: ['batch'],
      },
    },
  },
  {
    displayName: 'Token IDs',
    name: 'tokenIds',
    type: 'string',
    required: true,
    default: '',
    placeholder: '1,2,3,4,5',
    description: 'Comma-separated list of token IDs to register (for batchRegister)',
    displayOptions: {
      show: {
        resource: ['spg'],
        operation: ['batch'],
        batchAction: ['batchRegister'],
      },
    },
  },
  {
    displayName: 'Count',
    name: 'count',
    type: 'number',
    typeOptions: {
      minValue: 1,
      maxValue: 100,
    },
    required: true,
    default: 5,
    description: 'Number of NFTs to mint and register (for batchMintRegister)',
    displayOptions: {
      show: {
        resource: ['spg'],
        operation: ['batch'],
        batchAction: ['batchMintRegister'],
      },
    },
  },
  {
    displayName: 'Recipient',
    name: 'recipient',
    type: 'string',
    required: false,
    default: '',
    placeholder: '0x...',
    description: 'Recipient address (defaults to connected wallet)',
    displayOptions: {
      show: {
        resource: ['spg'],
        operation: ['batch'],
      },
    },
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const batchAction = this.getNodeParameter('batchAction', index) as string;
  const nftContract = this.getNodeParameter('nftContract', index) as string;
  const recipient = this.getNodeParameter('recipient', index, '') as string;

  const storyClient = await getStoryClient(this);
  const signer = storyClient.getSigner();
  const recipientAddress = recipient || (await signer.getAddress());

  try {
    switch (batchAction) {
      case 'batchRegister': {
        const tokenIdsStr = this.getNodeParameter('tokenIds', index) as string;
        const tokenIds = tokenIdsStr.split(',').map((id) => id.trim());

        // Register each token ID using the client's registerIpAsset method
        const results: Array<{ tokenId: string; ipId?: string; txHash?: string; error?: string }> = [];

        for (const tokenId of tokenIds) {
          try {
            const result = await storyClient.registerIpAsset(nftContract, tokenId);
            // Get the IP ID after registration
            const ipId = await storyClient.getIpId(nftContract, tokenId);
            results.push({
              tokenId,
              ipId,
              txHash: result.hash,
            });
          } catch (err) {
            results.push({
              tokenId,
              error: (err as Error).message,
            });
          }
        }

        return [
          {
            json: {
              success: true,
              batchAction,
              nftContract,
              results,
              totalProcessed: results.length,
              successCount: results.filter((r) => r.ipId).length,
              errorCount: results.filter((r) => r.error).length,
            } as IDataObject,
            pairedItem: { item: index },
          },
        ];
      }

      case 'batchMintRegister': {
        const count = this.getNodeParameter('count', index) as number;

        // For batch mint and register, we need to iterate since direct SDK method isn't available
        // This would typically call SPG contract directly
        const results: Array<{ index: number; success: boolean; message: string }> = [];

        for (let i = 0; i < count; i++) {
          results.push({
            index: i,
            success: false,
            message: 'Batch mint and register requires SPG contract interaction. Use individual mint and register operations.',
          });
        }

        return [
          {
            json: {
              success: false,
              batchAction,
              nftContract,
              recipient: recipientAddress,
              message: 'Batch mint and register is not directly supported. Please use the mintAndRegister operation for individual items.',
              results,
            } as IDataObject,
            pairedItem: { item: index },
          },
        ];
      }

      default:
        throw new NodeOperationError(this.getNode(), `Unknown batch action: ${batchAction}`);
    }
  } catch (error) {
    throw new NodeOperationError(
      this.getNode(),
      `Failed to execute batch operation: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
