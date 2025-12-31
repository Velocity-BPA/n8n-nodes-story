/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type { IExecuteFunctions, ILoadOptionsFunctions, IPollFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { NetworkId, getNetworkConfig } from '../constants';

export interface ApiClientConfig {
  network: NetworkId;
  apiKey: string;
  apiEndpoint?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface IPAssetResponse {
  id: string;
  chainId: number;
  tokenContract: string;
  tokenId: string;
  metadataUri: string;
  metadataHash: string;
  registrationDate: string;
  registrant: string;
  name?: string;
  owner?: string;
}

export interface LicenseResponse {
  id: string;
  ipId: string;
  licenseTemplate: string;
  licenseTermsId: number;
  attachedAt: string;
  terms?: Record<string, unknown>;
}

export interface LicenseTokenResponse {
  id: string;
  tokenId: string;
  licensorIpId: string;
  licenseTemplate: string;
  licenseTermsId: number;
  owner: string;
  mintedAt: string;
  amount: number;
}

export interface DerivativeResponse {
  childIpId: string;
  parentIpIds: string[];
  licenseTermsIds: number[];
  registeredAt: string;
}

export interface RoyaltyResponse {
  ipId: string;
  token: string;
  amount: string;
  payer: string;
  receiver: string;
  timestamp: string;
}

export interface DisputeResponse {
  id: string;
  targetIpId: string;
  initiator: string;
  evidenceLink: string;
  tag: string;
  status: 'PENDING' | 'RESOLVED' | 'CANCELLED';
  raisedAt: string;
  resolvedAt?: string;
}

export interface ModuleResponse {
  address: string;
  name: string;
  type: string;
  version: string;
}

export interface GroupResponse {
  id: string;
  name: string;
  owner: string;
  ipAssets: string[];
  createdAt: string;
}

export interface ApiListResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export class StoryApiClient {
  private client: AxiosInstance;

  constructor(config: ApiClientConfig) {
    const networkConfig = getNetworkConfig(config.network);
    const baseURL = config.apiEndpoint || networkConfig.apiUrl;

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey,
      },
      timeout: 30000,
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const message =
            (error.response.data as { message?: string })?.message ||
            error.message;
          throw new Error(`Story API Error: ${message} (${error.response.status})`);
        }
        throw error;
      },
    );
  }

  // IP Asset endpoints
  async getIPAsset(ipId: string): Promise<IPAssetResponse> {
    const response = await this.client.get(`/api/v1/ip-assets/${ipId}`);
    return response.data;
  }

  async listIPAssets(
    params: PaginationParams & {
      owner?: string;
      tokenContract?: string;
    } = {},
  ): Promise<ApiListResponse<IPAssetResponse>> {
    const response = await this.client.get('/api/v1/ip-assets', { params });
    return response.data;
  }

  async getIPAssetByToken(
    tokenContract: string,
    tokenId: string,
  ): Promise<IPAssetResponse | null> {
    const response = await this.client.get('/api/v1/ip-assets/by-token', {
      params: { tokenContract, tokenId },
    });
    return response.data;
  }

  async getIPAssetMetadata(ipId: string): Promise<Record<string, unknown>> {
    const response = await this.client.get(`/api/v1/ip-assets/${ipId}/metadata`);
    return response.data;
  }

  async getIPAssetOwners(ipId: string): Promise<string[]> {
    const response = await this.client.get(`/api/v1/ip-assets/${ipId}/owners`);
    return response.data;
  }

  // License endpoints
  async getLicense(ipId: string, licenseTermsId: number): Promise<LicenseResponse> {
    const response = await this.client.get(
      `/api/v1/ip-assets/${ipId}/licenses/${licenseTermsId}`,
    );
    return response.data;
  }

  async listLicenses(
    ipId?: string,
    params: PaginationParams = {},
  ): Promise<ApiListResponse<LicenseResponse>> {
    const endpoint = ipId ? `/api/v1/ip-assets/${ipId}/licenses` : '/api/v1/licenses';
    const response = await this.client.get(endpoint, { params });
    return response.data;
  }

  async getLicenseToken(tokenId: string): Promise<LicenseTokenResponse> {
    const response = await this.client.get(`/api/v1/license-tokens/${tokenId}`);
    return response.data;
  }

  async listLicenseTokens(
    params: PaginationParams & {
      owner?: string;
      licensorIpId?: string;
    } = {},
  ): Promise<ApiListResponse<LicenseTokenResponse>> {
    const response = await this.client.get('/api/v1/license-tokens', { params });
    return response.data;
  }

  async getLicensees(ipId: string): Promise<string[]> {
    const response = await this.client.get(`/api/v1/ip-assets/${ipId}/licensees`);
    return response.data;
  }

  // PIL Terms endpoints
  async getPILTerms(licenseTermsId: number): Promise<Record<string, unknown>> {
    const response = await this.client.get(`/api/v1/pil-terms/${licenseTermsId}`);
    return response.data;
  }

  async listPILTerms(
    params: PaginationParams = {},
  ): Promise<ApiListResponse<Record<string, unknown>>> {
    const response = await this.client.get('/api/v1/pil-terms', { params });
    return response.data;
  }

  // Derivative endpoints
  async getDerivative(childIpId: string): Promise<DerivativeResponse> {
    const response = await this.client.get(`/api/v1/derivatives/${childIpId}`);
    return response.data;
  }

  async listDerivatives(
    params: PaginationParams & {
      parentIpId?: string;
    } = {},
  ): Promise<ApiListResponse<DerivativeResponse>> {
    const response = await this.client.get('/api/v1/derivatives', { params });
    return response.data;
  }

  async getLineage(ipId: string): Promise<{
    ancestors: string[];
    descendants: string[];
    tree: Record<string, string[]>;
  }> {
    const response = await this.client.get(`/api/v1/ip-assets/${ipId}/lineage`);
    return response.data;
  }

  async getChildren(ipId: string): Promise<string[]> {
    const response = await this.client.get(`/api/v1/ip-assets/${ipId}/children`);
    return response.data;
  }

  async getParents(ipId: string): Promise<string[]> {
    const response = await this.client.get(`/api/v1/ip-assets/${ipId}/parents`);
    return response.data;
  }

  // Royalty endpoints
  async getRoyaltyBalance(
    ipId: string,
    token?: string,
  ): Promise<{ token: string; balance: string }[]> {
    const response = await this.client.get(`/api/v1/ip-assets/${ipId}/royalty-balance`, {
      params: { token },
    });
    return response.data;
  }

  async getRoyaltyPolicy(ipId: string): Promise<Record<string, unknown>> {
    const response = await this.client.get(`/api/v1/ip-assets/${ipId}/royalty-policy`);
    return response.data;
  }

  async getRoyaltyDistribution(ipId: string): Promise<Record<string, unknown>> {
    const response = await this.client.get(
      `/api/v1/ip-assets/${ipId}/royalty-distribution`,
    );
    return response.data;
  }

  async getRevenueTokens(ipId: string): Promise<{ token: string; amount: string }[]> {
    const response = await this.client.get(`/api/v1/ip-assets/${ipId}/revenue-tokens`);
    return response.data;
  }

  async getRoyaltyHistory(
    ipId: string,
    params: PaginationParams = {},
  ): Promise<ApiListResponse<RoyaltyResponse>> {
    const response = await this.client.get(`/api/v1/ip-assets/${ipId}/royalty-history`, {
      params,
    });
    return response.data;
  }

  async getLicenseRevenue(
    ipId: string,
    licenseTermsId: number,
  ): Promise<{ total: string; breakdown: Record<string, string> }> {
    const response = await this.client.get(
      `/api/v1/ip-assets/${ipId}/licenses/${licenseTermsId}/revenue`,
    );
    return response.data;
  }

  // Dispute endpoints
  async getDispute(disputeId: string): Promise<DisputeResponse> {
    const response = await this.client.get(`/api/v1/disputes/${disputeId}`);
    return response.data;
  }

  async listDisputes(
    params: PaginationParams & {
      targetIpId?: string;
      initiator?: string;
      status?: 'PENDING' | 'RESOLVED' | 'CANCELLED';
    } = {},
  ): Promise<ApiListResponse<DisputeResponse>> {
    const response = await this.client.get('/api/v1/disputes', { params });
    return response.data;
  }

  async getDisputeEvidence(disputeId: string): Promise<{ evidences: string[] }> {
    const response = await this.client.get(`/api/v1/disputes/${disputeId}/evidence`);
    return response.data;
  }

  async getArbitrationStatus(disputeId: string): Promise<Record<string, unknown>> {
    const response = await this.client.get(
      `/api/v1/disputes/${disputeId}/arbitration-status`,
    );
    return response.data;
  }

  // Module endpoints
  async getModule(address: string): Promise<ModuleResponse> {
    const response = await this.client.get(`/api/v1/modules/${address}`);
    return response.data;
  }

  async listModules(
    params: PaginationParams & {
      type?: string;
    } = {},
  ): Promise<ApiListResponse<ModuleResponse>> {
    const response = await this.client.get('/api/v1/modules', { params });
    return response.data;
  }

  async getModulePermissions(address: string): Promise<Record<string, unknown>> {
    const response = await this.client.get(`/api/v1/modules/${address}/permissions`);
    return response.data;
  }

  // Group endpoints
  async getGroup(groupId: string): Promise<GroupResponse> {
    const response = await this.client.get(`/api/v1/groups/${groupId}`);
    return response.data;
  }

  async listGroups(
    params: PaginationParams & {
      owner?: string;
    } = {},
  ): Promise<ApiListResponse<GroupResponse>> {
    const response = await this.client.get('/api/v1/groups', { params });
    return response.data;
  }

  async getGroupIPs(groupId: string): Promise<string[]> {
    const response = await this.client.get(`/api/v1/groups/${groupId}/ip-assets`);
    return response.data;
  }

  // Convenience methods (aliases)
  async getIpAssets(
    params: PaginationParams & {
      owner?: string;
      tokenContract?: string;
    } = {},
  ): Promise<IPAssetResponse[]> {
    const result = await this.listIPAssets(params);
    return result.data;
  }

  async getIPAssetLicenses(
    ipId: string,
    params: PaginationParams = {},
  ): Promise<LicenseResponse[]> {
    const result = await this.listLicenses(ipId, params);
    return result.data;
  }

  async getLicenses(
    params: PaginationParams = {},
  ): Promise<LicenseResponse[]> {
    const result = await this.listLicenses(undefined, params);
    return result.data;
  }

  async getLicenseTokens(
    params: PaginationParams & {
      owner?: string;
      licensorIpId?: string;
    } = {},
  ): Promise<LicenseTokenResponse[]> {
    const result = await this.listLicenseTokens(params);
    return result.data;
  }

  async getDerivatives(
    params: PaginationParams & {
      parentIpId?: string;
    } = {},
  ): Promise<DerivativeResponse[]> {
    const result = await this.listDerivatives(params);
    return result.data;
  }

  async getDisputes(
    params: PaginationParams & {
      targetIpId?: string;
      initiator?: string;
      status?: 'PENDING' | 'RESOLVED' | 'CANCELLED';
    } = {},
  ): Promise<DisputeResponse[]> {
    const result = await this.listDisputes(params);
    return result.data;
  }

  async getModules(
    params: PaginationParams & {
      type?: string;
    } = {},
  ): Promise<ModuleResponse[]> {
    const result = await this.listModules(params);
    return result.data;
  }

  async getGroups(
    params: PaginationParams & {
      owner?: string;
    } = {},
  ): Promise<GroupResponse[]> {
    const result = await this.listGroups(params);
    return result.data;
  }

  async getTransactions(
    ipId: string,
    params: PaginationParams = {},
  ): Promise<Record<string, unknown>[]> {
    // Note: This is a placeholder - actual implementation depends on API
    const response = await this.client.get(`/api/v1/ip-assets/${ipId}/transactions`, {
      params,
    });
    return response.data?.data || [];
  }

  async getRoyalties(
    ipId: string,
    params: PaginationParams = {},
  ): Promise<RoyaltyResponse[]> {
    const result = await this.getRoyaltyHistory(ipId, params);
    return result.data;
  }

  // Verification endpoints
  async verifyLicense(
    ipId: string,
    licenseTermsId: number,
    holder: string,
  ): Promise<{ valid: boolean; reason?: string }> {
    const response = await this.client.get(`/api/v1/verify/license`, {
      params: { ipId, licenseTermsId, holder },
    });
    return response.data;
  }

  async verifyDerivativeChain(
    childIpId: string,
    parentIpId: string,
  ): Promise<{ valid: boolean; path: string[] }> {
    const response = await this.client.get(`/api/v1/verify/derivative-chain`, {
      params: { childIpId, parentIpId },
    });
    return response.data;
  }
}

export async function getStoryApiClient(
  context: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
  credentialName = 'storyApi',
): Promise<StoryApiClient> {
  const credentials = await context.getCredentials(credentialName);

  if (!credentials) {
    throw new NodeOperationError(context.getNode(), 'No credentials provided for Story API');
  }

  return new StoryApiClient({
    network: credentials.network as NetworkId,
    apiKey: credentials.apiKey as string,
    apiEndpoint: credentials.apiEndpoint as string | undefined,
  });
}
