/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getStoryClient, StoryClient } from '../../transport';
import { ethers } from 'ethers';

export const description: INodeProperties[] = [
  {
    displayName: 'IP ID',
    name: 'ipId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The IP Asset ID to transfer',
    displayOptions: {
      show: {
        resource: ['ipAsset'],
        operation: ['transfer'],
      },
    },
  },
  {
    displayName: 'To Address',
    name: 'toAddress',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The recipient address',
    displayOptions: {
      show: {
        resource: ['ipAsset'],
        operation: ['transfer'],
      },
    },
  },
  {
    displayName: 'Token Contract',
    name: 'tokenContract',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The NFT contract address',
    displayOptions: {
      show: {
        resource: ['ipAsset'],
        operation: ['transfer'],
      },
    },
  },
  {
    displayName: 'Token ID',
    name: 'tokenId',
    type: 'string',
    required: true,
    default: '',
    description: 'The token ID to transfer',
    displayOptions: {
      show: {
        resource: ['ipAsset'],
        operation: ['transfer'],
      },
    },
  },
];

const ERC721_ABI = [
  'function safeTransferFrom(address from, address to, uint256 tokenId) external',
  'function ownerOf(uint256 tokenId) external view returns (address)',
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const ipId = this.getNodeParameter('ipId', index) as string;
  const toAddress = this.getNodeParameter('toAddress', index) as string;
  const tokenContract = this.getNodeParameter('tokenContract', index) as string;
  const tokenId = this.getNodeParameter('tokenId', index) as string;

  // Validate addresses
  if (!StoryClient.isValidAddress(toAddress)) {
    throw new NodeOperationError(
      this.getNode(),
      `Invalid recipient address: ${toAddress}`,
      { itemIndex: index },
    );
  }

  if (!StoryClient.isValidAddress(tokenContract)) {
    throw new NodeOperationError(
      this.getNode(),
      `Invalid token contract address: ${tokenContract}`,
      { itemIndex: index },
    );
  }

  const client = await getStoryClient(this);

  try {
    const provider = client.getProvider();
    const credentials = await this.getCredentials('storyProtocol');
    let privateKey = credentials.privateKey as string;
    if (!privateKey.startsWith('0x')) {
      privateKey = `0x${privateKey}`;
    }
    const wallet = new ethers.Wallet(privateKey, provider);

    const nftContract = new ethers.Contract(tokenContract, ERC721_ABI, wallet);

    // Get current owner
    const currentOwner = await nftContract.ownerOf(tokenId);
    
    // Transfer the NFT
    const tx = await nftContract.safeTransferFrom(currentOwner, toAddress, tokenId);
    const receipt = await tx.wait();

    return [
      {
        json: {
          success: receipt.status === 1,
          ipId,
          from: currentOwner,
          to: toAddress,
          tokenContract,
          tokenId,
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
        },
        pairedItem: { item: index },
      },
    ];
  } catch (error) {
    throw new NodeOperationError(
      this.getNode(),
      `Failed to transfer IP Asset: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
