/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export enum NetworkId {
  MAINNET = 'mainnet',
  AENEID_TESTNET = 'aeneid',
}

export interface NetworkConfig {
  id: NetworkId;
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  apiUrl: string;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const NETWORKS: Record<NetworkId, NetworkConfig> = {
  [NetworkId.MAINNET]: {
    id: NetworkId.MAINNET,
    name: 'Story Mainnet',
    chainId: 1513,
    rpcUrl: 'https://mainnet.storyrpc.io',
    explorerUrl: 'https://explorer.story.foundation',
    apiUrl: 'https://api.story.foundation',
    currency: {
      name: 'IP Token',
      symbol: 'IP',
      decimals: 18,
    },
  },
  [NetworkId.AENEID_TESTNET]: {
    id: NetworkId.AENEID_TESTNET,
    name: 'Story Aeneid Testnet',
    chainId: 1315,
    rpcUrl: 'https://aeneid.storyrpc.io',
    explorerUrl: 'https://aeneid.explorer.story.foundation',
    apiUrl: 'https://api.aeneid.story.foundation',
    currency: {
      name: 'IP Token',
      symbol: 'IP',
      decimals: 18,
    },
  },
};

export const DEFAULT_NETWORK = NetworkId.AENEID_TESTNET;

export function getNetworkConfig(networkId: NetworkId): NetworkConfig {
  const config = NETWORKS[networkId];
  if (!config) {
    throw new Error(`Unknown network: ${networkId}`);
  }
  return config;
}

export function getNetworkByChainId(chainId: number): NetworkConfig | undefined {
  return Object.values(NETWORKS).find((network) => network.chainId === chainId);
}
