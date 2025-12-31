/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IPollFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { getStoryApiClient } from './transport';

interface PollState {
  lastTimestamp?: string;
  lastEventIds?: string[];
}

export class StoryTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Story Protocol Trigger',
    name: 'storyTrigger',
    icon: 'file:story.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Triggers when Story Protocol events occur',
    defaults: {
      name: 'Story Protocol Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'storyApi',
        required: true,
      },
    ],
    polling: true,
    properties: [
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        options: [
          {
            name: 'IP Asset Registered',
            value: 'ipAssetRegistered',
            description: 'Triggers when a new IP Asset is registered',
          },
          {
            name: 'IP Asset Transferred',
            value: 'ipAssetTransferred',
            description: 'Triggers when an IP Asset is transferred',
          },
          {
            name: 'License Terms Attached',
            value: 'licenseTermsAttached',
            description: 'Triggers when license terms are attached to an IP',
          },
          {
            name: 'License Token Minted',
            value: 'licenseTokenMinted',
            description: 'Triggers when license tokens are minted',
          },
          {
            name: 'Derivative Registered',
            value: 'derivativeRegistered',
            description: 'Triggers when a derivative is registered',
          },
          {
            name: 'Royalty Paid',
            value: 'royaltyPaid',
            description: 'Triggers when royalty is paid',
          },
          {
            name: 'Royalty Claimed',
            value: 'royaltyClaimed',
            description: 'Triggers when royalty is claimed',
          },
          {
            name: 'Dispute Raised',
            value: 'disputeRaised',
            description: 'Triggers when a dispute is raised',
          },
          {
            name: 'Dispute Resolved',
            value: 'disputeResolved',
            description: 'Triggers when a dispute is resolved',
          },
        ],
        default: 'ipAssetRegistered',
        required: true,
      },
      {
        displayName: 'Filter by IP Asset',
        name: 'filterByIp',
        type: 'boolean',
        default: false,
        description: 'Whether to filter events by a specific IP Asset',
      },
      {
        displayName: 'IP Asset ID',
        name: 'ipId',
        type: 'string',
        default: '',
        placeholder: '0x...',
        description: 'Filter events for this IP Asset',
        displayOptions: {
          show: {
            filterByIp: [true],
          },
        },
      },
      {
        displayName: 'Filter by Owner',
        name: 'filterByOwner',
        type: 'boolean',
        default: false,
        description: 'Whether to filter events by owner address',
        displayOptions: {
          show: {
            event: ['ipAssetRegistered', 'ipAssetTransferred'],
          },
        },
      },
      {
        displayName: 'Owner Address',
        name: 'ownerAddress',
        type: 'string',
        default: '',
        placeholder: '0x...',
        description: 'Filter events for this owner',
        displayOptions: {
          show: {
            filterByOwner: [true],
          },
        },
      },
    ],
  };

  async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
    const event = this.getNodeParameter('event') as string;
    const filterByIp = this.getNodeParameter('filterByIp', false) as boolean;
    const ipId = filterByIp ? (this.getNodeParameter('ipId', '') as string) : '';
    const filterByOwner = this.getNodeParameter('filterByOwner', false) as boolean;
    const ownerAddress = filterByOwner ? (this.getNodeParameter('ownerAddress', '') as string) : '';

    const webhookData = this.getWorkflowStaticData('node') as PollState;
    const apiClient = await getStoryApiClient(this);

    try {
      let events: unknown[] = [];
      const params: Record<string, unknown> = {
        limit: 100,
        orderBy: 'timestamp',
        orderDirection: 'desc',
      };

      if (webhookData.lastTimestamp) {
        params.fromTimestamp = webhookData.lastTimestamp;
      }

      if (ipId) {
        params.ipId = ipId;
      }

      if (ownerAddress) {
        params.owner = ownerAddress;
      }

      // Fetch events based on type
      switch (event) {
        case 'ipAssetRegistered':
          events = await apiClient.getIpAssets(params as Record<string, unknown>);
          break;

        case 'ipAssetTransferred':
          // Get transfer events from transactions
          events = await apiClient.getTransactions(ipId || '', params as Record<string, unknown>);
          break;

        case 'licenseTermsAttached':
          events = await apiClient.getLicenses(params as Record<string, unknown>);
          break;

        case 'licenseTokenMinted':
          events = await apiClient.getLicenseTokens(params as Record<string, unknown>);
          break;

        case 'derivativeRegistered':
          events = await apiClient.getDerivatives(params as Record<string, unknown>);
          break;

        case 'royaltyPaid':
        case 'royaltyClaimed':
          if (ipId) {
            events = await apiClient.getRoyalties(ipId, params as Record<string, unknown>);
          }
          break;

        case 'disputeRaised':
        case 'disputeResolved':
          events = await apiClient.getDisputes({
            ...params,
            status: event === 'disputeRaised' ? 'PENDING' : 'RESOLVED',
          } as Record<string, unknown>);
          break;
      }

      // Filter out already processed events
      const lastEventIds = webhookData.lastEventIds || [];
      const newEvents = events.filter((e: unknown) => {
        const eventObj = e as { id?: string; ipId?: string; timestamp?: string };
        const eventId = eventObj.id || eventObj.ipId || JSON.stringify(e);
        return !lastEventIds.includes(eventId);
      });

      if (newEvents.length === 0) {
        return null;
      }

      // Update state
      const newEventIds = newEvents.map((e: unknown) => {
        const eventObj = e as { id?: string; ipId?: string };
        return eventObj.id || eventObj.ipId || JSON.stringify(e);
      });
      webhookData.lastEventIds = [...newEventIds, ...lastEventIds].slice(0, 1000);

      const latestEvent = newEvents[0] as { timestamp?: string; createdAt?: string };
      if (latestEvent.timestamp || latestEvent.createdAt) {
        webhookData.lastTimestamp = latestEvent.timestamp || latestEvent.createdAt;
      }

      // Return results
      return [
        newEvents.map((eventData) => ({
          json: {
            eventType: event,
            ...(eventData as object),
          },
        })),
      ];
    } catch (error) {
      // Log error but don't fail - will retry on next poll
      console.error(`Story Protocol Trigger error: ${(error as Error).message}`);
      return null;
    }
  }
}
