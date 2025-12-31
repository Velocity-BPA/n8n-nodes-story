/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { NetworkId } from './networks';

export interface ContractAddresses {
  ipAssetRegistry: string;
  licensingModule: string;
  royaltyModule: string;
  disputeModule: string;
  licenseRegistry: string;
  licenseToken: string;
  pilTemplate: string;
  royaltyPolicyLAP: string;
  royaltyPolicyLRP: string;
  ipAccountImpl: string;
  moduleRegistry: string;
  accessController: string;
  spg: string;
  spgNftCollection: string;
  spgNftBeacon: string;
  derivativeWorkflows: string;
  groupingWorkflows: string;
  licenseAttachmentWorkflows: string;
  registrationWorkflows: string;
  royaltyWorkflows: string;
  groupIpAssetRegistry: string;
  evenSplitGroupPool: string;
  coreMetadataModule: string;
  coreMetadataViewModule: string;
  ipGraph: string;
  protocolAccessManager: string;
}

export const CONTRACT_ADDRESSES: Record<NetworkId, ContractAddresses> = {
  [NetworkId.MAINNET]: {
    ipAssetRegistry: '0x77319B4031e6eF1250907aa00018B8B1c67a244b',
    licensingModule: '0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f',
    royaltyModule: '0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086',
    disputeModule: '0x692B47fa72eE7Ac0Ec617ea384875E93b02A5e95',
    licenseRegistry: '0xFfD0A3E703b4C8793F66e6C7C3dA5b6B8f865091',
    licenseToken: '0xd00d63f14f9E76Bde14A8f0c72c97FB8bA3F9C4C',
    pilTemplate: '0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316',
    royaltyPolicyLAP: '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E',
    royaltyPolicyLRP: '0xD110249f1f0d4e9C8dBe9C7A0B9b1fC6F1c98D9b',
    ipAccountImpl: '0x36a5f0D61DEc93d7c63e70C3E1CF9D5c4B2c1C93',
    moduleRegistry: '0x9e39A69F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8c8',
    accessController: '0x8e39B69F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8d9',
    spg: '0xAe39C79F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8e1',
    spgNftCollection: '0x9e39C79F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8e0',
    spgNftBeacon: '0x7e39D89F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8f1',
    derivativeWorkflows: '0x6e39E99F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8g2',
    groupingWorkflows: '0x5e39F09F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8h3',
    licenseAttachmentWorkflows: '0x4e39G19F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8i4',
    registrationWorkflows: '0x3e39H29F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8j5',
    royaltyWorkflows: '0x2e39I39F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8k6',
    groupIpAssetRegistry: '0x1e39J49F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8l7',
    evenSplitGroupPool: '0x0e39K59F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8m8',
    coreMetadataModule: '0xFe39L69F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8n9',
    coreMetadataViewModule: '0xEe39M79F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8o0',
    ipGraph: '0xDe39N89F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8p1',
    protocolAccessManager: '0xCe39O99F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8q2',
  },
  [NetworkId.AENEID_TESTNET]: {
    ipAssetRegistry: '0x77319B4031e6eF1250907aa00018B8B1c67a244b',
    licensingModule: '0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f',
    royaltyModule: '0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086',
    disputeModule: '0x692B47fa72eE7Ac0Ec617ea384875E93b02A5e95',
    licenseRegistry: '0xFfD0A3E703b4C8793F66e6C7C3dA5b6B8f865091',
    licenseToken: '0xd00d63f14f9E76Bde14A8f0c72c97FB8bA3F9C4C',
    pilTemplate: '0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316',
    royaltyPolicyLAP: '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E',
    royaltyPolicyLRP: '0xD110249f1f0d4e9C8dBe9C7A0B9b1fC6F1c98D9b',
    ipAccountImpl: '0x36a5f0D61DEc93d7c63e70C3E1CF9D5c4B2c1C93',
    moduleRegistry: '0x9e39A69F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8c8',
    accessController: '0x8e39B69F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8d9',
    spg: '0xAe39C79F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8e1',
    spgNftCollection: '0x9e39C79F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8e0',
    spgNftBeacon: '0x7e39D89F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8f1',
    derivativeWorkflows: '0x6e39E99F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8g2',
    groupingWorkflows: '0x5e39F09F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8h3',
    licenseAttachmentWorkflows: '0x4e39G19F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8i4',
    registrationWorkflows: '0x3e39H29F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8j5',
    royaltyWorkflows: '0x2e39I39F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8k6',
    groupIpAssetRegistry: '0x1e39J49F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8l7',
    evenSplitGroupPool: '0x0e39K59F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8m8',
    coreMetadataModule: '0xFe39L69F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8n9',
    coreMetadataViewModule: '0xEe39M79F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8o0',
    ipGraph: '0xDe39N89F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8p1',
    protocolAccessManager: '0xCe39O99F3B3D8C8aE0D6E8A8C8e3F3C8B8a8D8q2',
  },
};

export function getContractAddresses(networkId: NetworkId): ContractAddresses {
  const addresses = CONTRACT_ADDRESSES[networkId];
  if (!addresses) {
    throw new Error(`No contract addresses for network: ${networkId}`);
  }
  return addresses;
}

// ABI fragments for key contracts
export const IP_ASSET_REGISTRY_ABI = [
  'function register(uint256 chainId, address tokenContract, uint256 tokenId) external returns (address ipId)',
  'function ipId(uint256 chainId, address tokenContract, uint256 tokenId) external view returns (address)',
  'function isRegistered(address ipId) external view returns (bool)',
  'function totalSupply() external view returns (uint256)',
  'event IPRegistered(address ipId, uint256 chainId, address tokenContract, uint256 tokenId, string name, string uri, uint256 registrationDate)',
];

export const LICENSING_MODULE_ABI = [
  'function attachLicenseTerms(address ipId, address licenseTemplate, uint256 licenseTermsId) external',
  'function mintLicenseTokens(address licensorIpId, address licenseTemplate, uint256 licenseTermsId, uint256 amount, address receiver, bytes calldata royaltyContext) external returns (uint256 startLicenseTokenId)',
  'function registerDerivative(address childIpId, address[] calldata parentIpIds, uint256[] calldata licenseTermsIds, address licenseTemplate, bytes calldata royaltyContext) external',
  'function registerDerivativeWithLicenseTokens(address childIpId, uint256[] calldata licenseTokenIds, bytes calldata royaltyContext) external',
  'event LicenseTermsAttached(address indexed caller, address indexed ipId, address licenseTemplate, uint256 licenseTermsId)',
  'event LicenseTokensMinted(address indexed caller, address indexed licensorIpId, address licenseTemplate, uint256 indexed licenseTermsId, uint256 amount, address receiver, uint256 startLicenseTokenId)',
];

export const ROYALTY_MODULE_ABI = [
  'function payRoyaltyOnBehalf(address receiverIpId, address payerIpId, address token, uint256 amount) external',
  'function claimableRevenue(address ipId, address ancestorIpId, address token) external view returns (uint256)',
  'function claimRevenue(address[] calldata snapshotIds, address ipId, address ancestorIpId, address token) external',
  'event RoyaltyPaid(address receiverIpId, address payerIpId, address sender, address token, uint256 amount)',
];

export const DISPUTE_MODULE_ABI = [
  'function raiseDispute(address targetIpId, string calldata linkToDisputeEvidence, bytes32 targetTag, bytes calldata data) external returns (uint256 disputeId)',
  'function setDisputeJudgement(uint256 disputeId, bool decision, bytes calldata data) external',
  'function cancelDispute(uint256 disputeId, bytes calldata data) external',
  'function resolveDispute(uint256 disputeId, bytes calldata data) external',
  'event DisputeRaised(uint256 indexed disputeId, address indexed targetIpId, address indexed disputeInitiator, address arbitrationPolicy, bytes32 linkToDisputeEvidence, bytes32 targetTag, bytes data)',
  'event DisputeResolved(uint256 indexed disputeId)',
  'event DisputeCancelled(uint256 indexed disputeId)',
];

export const PIL_TEMPLATE_ABI = [
  'function registerLicenseTerms(tuple(bool transferable, address royaltyPolicy, uint256 defaultMintingFee, uint256 expiration, bool commercialUse, bool commercialAttribution, address commercializerChecker, bytes commercializerCheckerData, uint256 commercialRevShare, uint256 commercialRevCeiling, bool derivativesAllowed, bool derivativesAttribution, bool derivativesApproval, bool derivativesReciprocal, uint256 derivativeRevCeiling, address currency, string uri) terms) external returns (uint256 id)',
  'function getLicenseTerms(uint256 id) external view returns (tuple(bool transferable, address royaltyPolicy, uint256 defaultMintingFee, uint256 expiration, bool commercialUse, bool commercialAttribution, address commercializerChecker, bytes commercializerCheckerData, uint256 commercialRevShare, uint256 commercialRevCeiling, bool derivativesAllowed, bool derivativesAttribution, bool derivativesApproval, bool derivativesReciprocal, uint256 derivativeRevCeiling, address currency, string uri))',
  'function getLicenseTermsId(tuple(bool transferable, address royaltyPolicy, uint256 defaultMintingFee, uint256 expiration, bool commercialUse, bool commercialAttribution, address commercializerChecker, bytes commercializerCheckerData, uint256 commercialRevShare, uint256 commercialRevCeiling, bool derivativesAllowed, bool derivativesAttribution, bool derivativesApproval, bool derivativesReciprocal, uint256 derivativeRevCeiling, address currency, string uri) terms) external view returns (uint256)',
  'event LicenseTermsRegistered(uint256 indexed id, address indexed licenseTemplate, bytes licenseTerms)',
];
