/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getStoryClient } from '../../transport';
import { getContractAddresses, NetworkId } from '../../constants';

export const description: INodeProperties[] = [
  {
    displayName: 'NFT Contract',
    name: 'nftContract',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The NFT collection contract address (must be SPG-compatible)',
    displayOptions: {
      show: {
        resource: ['spg'],
        operation: ['mintAndRegister'],
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
    description: 'Recipient address for the minted NFT (defaults to connected wallet)',
    displayOptions: {
      show: {
        resource: ['spg'],
        operation: ['mintAndRegister'],
      },
    },
  },
  {
    displayName: 'Metadata URI',
    name: 'metadataUri',
    type: 'string',
    required: false,
    default: '',
    placeholder: 'ipfs://...',
    description: 'Metadata URI for the IP Asset',
    displayOptions: {
      show: {
        resource: ['spg'],
        operation: ['mintAndRegister'],
      },
    },
  },
  {
    displayName: 'Metadata Hash',
    name: 'metadataHash',
    type: 'string',
    required: false,
    default: '',
    placeholder: '0x...',
    description: 'Hash of the metadata content',
    displayOptions: {
      show: {
        resource: ['spg'],
        operation: ['mintAndRegister'],
      },
    },
  },
  {
    displayName: 'License Terms ID',
    name: 'licenseTermsId',
    type: 'string',
    required: false,
    default: '',
    description: 'Optional license terms to attach',
    displayOptions: {
      show: {
        resource: ['spg'],
        operation: ['mintAndRegister'],
      },
    },
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const nftContract = this.getNodeParameter('nftContract', index) as string;
  const recipient = this.getNodeParameter('recipient', index, '') as string;
  const metadataUri = this.getNodeParameter('metadataUri', index, '') as string;

  const storyClient = await getStoryClient(this);
  const signer = storyClient.getSigner();
  const recipientAddress = recipient || (await signer.getAddress());

  try {
    const credentials = await this.getCredentials('storyProtocol');
    const network = credentials.network as NetworkId;
    const contracts = getContractAddresses(network);

    // For mintAndRegister via SPG, we need to:
    // 1. First ensure the NFT contract is an SPG-compatible contract
    // 2. Call the appropriate registration method
    
    // Since we don't have direct SPG integration, we provide guidance
    // For now, this performs a basic registration after assuming the NFT exists
    
    // Check if we have an existing token to register (typical flow)
    // If the user wants to mint, they need to do it via the NFT contract first

    return [
      {
        json: {
          success: false,
          message: 'Mint and Register via SPG requires direct SPG contract interaction. Please ensure your NFT contract is SPG-compatible and use the standard Register IP Asset operation after minting.',
          nftContract,
          recipient: recipientAddress,
          metadataUri,
          spgAddress: contracts.spg,
          hint: 'For full SPG functionality, mint an NFT first using your collection contract, then use the IP Asset > Register operation.',
        } as IDataObject,
        pairedItem: { item: index },
      },
    ];
  } catch (error) {
    throw new NodeOperationError(
      this.getNode(),
      `Failed to mint and register: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
