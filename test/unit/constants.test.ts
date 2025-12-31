/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { NetworkId, NETWORKS, getNetworkConfig } from '../../nodes/Story/constants/networks';
import { CONTRACT_ADDRESSES, getContractAddresses } from '../../nodes/Story/constants/contracts';

describe('Networks', () => {
  describe('NETWORKS', () => {
    it('should have mainnet configuration', () => {
      const mainnet = NETWORKS[NetworkId.MAINNET];
      
      expect(mainnet).toBeDefined();
      expect(mainnet.chainId).toBe(1513);
      expect(mainnet.name).toBe('Story Mainnet');
      expect(mainnet.rpcUrl).toBeDefined();
    });

    it('should have aeneid testnet configuration', () => {
      const testnet = NETWORKS[NetworkId.AENEID_TESTNET];
      
      expect(testnet).toBeDefined();
      expect(testnet.chainId).toBe(1315);
      expect(testnet.name).toBe('Story Aeneid Testnet');
      expect(testnet.rpcUrl).toBeDefined();
    });
  });

  describe('getNetworkConfig', () => {
    it('should return mainnet config', () => {
      const config = getNetworkConfig(NetworkId.MAINNET);
      
      expect(config.chainId).toBe(1513);
    });

    it('should return testnet config', () => {
      const config = getNetworkConfig(NetworkId.AENEID_TESTNET);
      
      expect(config.chainId).toBe(1315);
    });
  });
});

describe('Contract Addresses', () => {
  describe('CONTRACT_ADDRESSES', () => {
    it('should have mainnet contract addresses', () => {
      const mainnet = CONTRACT_ADDRESSES[NetworkId.MAINNET];
      
      expect(mainnet).toBeDefined();
      expect(mainnet.ipAssetRegistry).toBeDefined();
      expect(mainnet.licensingModule).toBeDefined();
      expect(mainnet.royaltyModule).toBeDefined();
      expect(mainnet.disputeModule).toBeDefined();
    });

    it('should have testnet contract addresses', () => {
      const testnet = CONTRACT_ADDRESSES[NetworkId.AENEID_TESTNET];
      
      expect(testnet).toBeDefined();
      expect(testnet.ipAssetRegistry).toBeDefined();
      expect(testnet.licensingModule).toBeDefined();
    });

    it('should have valid Ethereum addresses', () => {
      const mainnet = CONTRACT_ADDRESSES[NetworkId.MAINNET];
      const addressRegex = /^0x[a-fA-F0-9]{40}$/;
      
      expect(mainnet.ipAssetRegistry).toMatch(addressRegex);
      expect(mainnet.licensingModule).toMatch(addressRegex);
    });
  });

  describe('getContractAddresses', () => {
    it('should return correct contract addresses for mainnet', () => {
      const addresses = getContractAddresses(NetworkId.MAINNET);
      
      expect(addresses.ipAssetRegistry).toBe(CONTRACT_ADDRESSES[NetworkId.MAINNET].ipAssetRegistry);
    });

    it('should return correct contract addresses for testnet', () => {
      const addresses = getContractAddresses(NetworkId.AENEID_TESTNET);
      
      expect(addresses.licensingModule).toBe(CONTRACT_ADDRESSES[NetworkId.AENEID_TESTNET].licensingModule);
    });
  });
});
