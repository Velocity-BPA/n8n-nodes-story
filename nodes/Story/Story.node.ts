/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import * as ipAsset from './actions/ipAsset';
import * as license from './actions/license';
import * as derivative from './actions/derivative';
import * as royalty from './actions/royalty';
import * as dispute from './actions/dispute';
import * as module from './actions/module';
import * as group from './actions/group';
import * as spg from './actions/spg';

export class Story implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Story Protocol',
    name: 'story',
    icon: 'file:story.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description:
      'Interact with Story Protocol - programmable IP infrastructure for registering, licensing, and managing intellectual property on-chain',
    defaults: {
      name: 'Story Protocol',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'storyProtocol',
        required: true,
        displayOptions: {
          show: {
            resource: ['ipAsset', 'license', 'derivative', 'royalty', 'dispute', 'spg'],
          },
        },
      },
      {
        name: 'storyApi',
        required: false,
        displayOptions: {
          show: {
            resource: ['ipAsset', 'license', 'derivative', 'royalty', 'dispute', 'module', 'group'],
          },
        },
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'IP Asset',
            value: 'ipAsset',
            description: 'Register and manage intellectual property assets',
          },
          {
            name: 'License',
            value: 'license',
            description: 'Manage license terms and tokens',
          },
          {
            name: 'Derivative',
            value: 'derivative',
            description: 'Create and manage derivative works',
          },
          {
            name: 'Royalty',
            value: 'royalty',
            description: 'Manage royalty payments and claims',
          },
          {
            name: 'Dispute',
            value: 'dispute',
            description: 'Handle IP disputes',
          },
          {
            name: 'Module',
            value: 'module',
            description: 'View protocol modules',
          },
          {
            name: 'Group',
            value: 'group',
            description: 'Manage IP groups',
          },
          {
            name: 'SPG',
            value: 'spg',
            description: 'Story Protocol Gateway batch operations',
          },
        ],
        default: 'ipAsset',
      },
      // IP Asset operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['ipAsset'],
          },
        },
        options: [
          {
            name: 'Register',
            value: 'register',
            description: 'Register an NFT as an IP Asset',
            action: 'Register an IP asset',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get IP Asset details',
            action: 'Get an IP asset',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List IP Assets',
            action: 'List IP assets',
          },
          {
            name: 'Transfer',
            value: 'transfer',
            description: 'Transfer IP Asset ownership',
            action: 'Transfer an IP asset',
          },
          {
            name: 'Metadata',
            value: 'metadata',
            description: 'Get or update IP Asset metadata',
            action: 'Manage IP asset metadata',
          },
        ],
        default: 'register',
      },
      // License operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['license'],
          },
        },
        options: [
          {
            name: 'Attach',
            value: 'attach',
            description: 'Attach license terms to an IP Asset',
            action: 'Attach license terms',
          },
          {
            name: 'Mint',
            value: 'mint',
            description: 'Mint license tokens',
            action: 'Mint license tokens',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get license information',
            action: 'Get license info',
          },
          {
            name: 'Verify',
            value: 'verify',
            description: 'Verify license validity',
            action: 'Verify a license',
          },
        ],
        default: 'attach',
      },
      // Derivative operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['derivative'],
          },
        },
        options: [
          {
            name: 'Register',
            value: 'register',
            description: 'Register a derivative work',
            action: 'Register a derivative',
          },
          {
            name: 'Link',
            value: 'link',
            description: 'Link derivative using license tokens',
            action: 'Link a derivative',
          },
          {
            name: 'Lineage',
            value: 'lineage',
            description: 'Get IP lineage tree',
            action: 'Get lineage tree',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List derivatives or parents',
            action: 'List derivatives',
          },
        ],
        default: 'register',
      },
      // Royalty operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['royalty'],
          },
        },
        options: [
          {
            name: 'Claim',
            value: 'claim',
            description: 'Claim royalty revenue',
            action: 'Claim royalty',
          },
          {
            name: 'Pay',
            value: 'pay',
            description: 'Pay royalty to IP Asset',
            action: 'Pay royalty',
          },
          {
            name: 'Balance',
            value: 'balance',
            description: 'Get royalty balance info',
            action: 'Get royalty balance',
          },
          {
            name: 'Distribution',
            value: 'distribution',
            description: 'Get royalty distribution',
            action: 'Get distribution',
          },
        ],
        default: 'claim',
      },
      // Dispute operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['dispute'],
          },
        },
        options: [
          {
            name: 'Raise',
            value: 'raise',
            description: 'Raise a dispute against an IP',
            action: 'Raise a dispute',
          },
          {
            name: 'Resolve',
            value: 'resolve',
            description: 'Resolve or cancel a dispute',
            action: 'Resolve a dispute',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get dispute information',
            action: 'Get dispute info',
          },
        ],
        default: 'raise',
      },
      // Module operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['module'],
          },
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            description: 'Get module information',
            action: 'Get module info',
          },
        ],
        default: 'get',
      },
      // Group operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['group'],
          },
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            description: 'Get group information',
            action: 'Get group info',
          },
        ],
        default: 'get',
      },
      // SPG operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['spg'],
          },
        },
        options: [
          {
            name: 'Mint and Register',
            value: 'mintAndRegister',
            description: 'Mint NFT and register as IP in one transaction',
            action: 'Mint and register IP',
          },
          {
            name: 'Batch',
            value: 'batch',
            description: 'Execute batch operations',
            action: 'Execute batch operation',
          },
        ],
        default: 'mintAndRegister',
      },
      // Import all operation properties
      ...ipAsset.register.description,
      ...ipAsset.get.description,
      ...ipAsset.list.description,
      ...ipAsset.transfer.description,
      ...ipAsset.metadata.description,
      ...license.attach.description,
      ...license.mint.description,
      ...license.get.description,
      ...license.verify.description,
      ...derivative.register.description,
      ...derivative.link.description,
      ...derivative.lineage.description,
      ...derivative.list.description,
      ...royalty.claim.description,
      ...royalty.pay.description,
      ...royalty.balance.description,
      ...royalty.distribution.description,
      ...dispute.raise.description,
      ...dispute.resolve.description,
      ...dispute.get.description,
      ...module.get.description,
      ...group.get.description,
      ...spg.mintAndRegister.description,
      ...spg.batch.description,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let result: INodeExecutionData[] = [];

        switch (resource) {
          case 'ipAsset':
            switch (operation) {
              case 'register':
                result = await ipAsset.register.execute.call(this, i);
                break;
              case 'get':
                result = await ipAsset.get.execute.call(this, i);
                break;
              case 'list':
                result = await ipAsset.list.execute.call(this, i);
                break;
              case 'transfer':
                result = await ipAsset.transfer.execute.call(this, i);
                break;
              case 'metadata':
                result = await ipAsset.metadata.execute.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown IP Asset operation: ${operation}`,
                );
            }
            break;

          case 'license':
            switch (operation) {
              case 'attach':
                result = await license.attach.execute.call(this, i);
                break;
              case 'mint':
                result = await license.mint.execute.call(this, i);
                break;
              case 'get':
                result = await license.get.execute.call(this, i);
                break;
              case 'verify':
                result = await license.verify.execute.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown License operation: ${operation}`,
                );
            }
            break;

          case 'derivative':
            switch (operation) {
              case 'register':
                result = await derivative.register.execute.call(this, i);
                break;
              case 'link':
                result = await derivative.link.execute.call(this, i);
                break;
              case 'lineage':
                result = await derivative.lineage.execute.call(this, i);
                break;
              case 'list':
                result = await derivative.list.execute.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown Derivative operation: ${operation}`,
                );
            }
            break;

          case 'royalty':
            switch (operation) {
              case 'claim':
                result = await royalty.claim.execute.call(this, i);
                break;
              case 'pay':
                result = await royalty.pay.execute.call(this, i);
                break;
              case 'balance':
                result = await royalty.balance.execute.call(this, i);
                break;
              case 'distribution':
                result = await royalty.distribution.execute.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown Royalty operation: ${operation}`,
                );
            }
            break;

          case 'dispute':
            switch (operation) {
              case 'raise':
                result = await dispute.raise.execute.call(this, i);
                break;
              case 'resolve':
                result = await dispute.resolve.execute.call(this, i);
                break;
              case 'get':
                result = await dispute.get.execute.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown Dispute operation: ${operation}`,
                );
            }
            break;

          case 'module':
            switch (operation) {
              case 'get':
                result = await module.get.execute.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown Module operation: ${operation}`,
                );
            }
            break;

          case 'group':
            switch (operation) {
              case 'get':
                result = await group.get.execute.call(this, i);
                break;
              default:
                throw new NodeOperationError(
                  this.getNode(),
                  `Unknown Group operation: ${operation}`,
                );
            }
            break;

          case 'spg':
            switch (operation) {
              case 'mintAndRegister':
                result = await spg.mintAndRegister.execute.call(this, i);
                break;
              case 'batch':
                result = await spg.batch.execute.call(this, i);
                break;
              default:
                throw new NodeOperationError(this.getNode(), `Unknown SPG operation: ${operation}`);
            }
            break;

          default:
            throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
        }

        returnData.push(...result);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
