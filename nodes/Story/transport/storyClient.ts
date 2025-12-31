/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ethers } from 'ethers';
import type { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
  NetworkId,
  getNetworkConfig,
  getContractAddresses,
  IP_ASSET_REGISTRY_ABI,
  LICENSING_MODULE_ABI,
  ROYALTY_MODULE_ABI,
  DISPUTE_MODULE_ABI,
  PIL_TEMPLATE_ABI,
} from '../constants';

// License notice logged once per module load
const licenseNoticeLogged = false;
function logLicenseNotice(): void {
  if (!licenseNoticeLogged) {
    // eslint-disable-next-line no-console
    console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`);
  }
}

export interface StoryClientConfig {
  network: NetworkId;
  rpcUrl?: string;
  privateKey?: string;
  mnemonic?: string;
  derivationPath?: string;
}

export interface TransactionResult {
  hash: string;
  blockNumber: number;
  status: boolean;
  gasUsed: string;
  events: EventLog[];
}

export interface EventLog {
  name: string;
  args: Record<string, unknown>;
}

export class StoryClient {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private network: NetworkId;
  private contracts: {
    ipAssetRegistry: ethers.Contract;
    licensingModule: ethers.Contract;
    royaltyModule: ethers.Contract;
    disputeModule: ethers.Contract;
    pilTemplate: ethers.Contract;
  };

  constructor(config: StoryClientConfig) {
    logLicenseNotice();

    this.network = config.network;
    const networkConfig = getNetworkConfig(config.network);
    const rpcUrl = config.rpcUrl || networkConfig.rpcUrl;

    this.provider = new ethers.JsonRpcProvider(rpcUrl, {
      chainId: networkConfig.chainId,
      name: networkConfig.name,
    });

    if (config.privateKey) {
      const key = config.privateKey.startsWith('0x')
        ? config.privateKey
        : `0x${config.privateKey}`;
      this.wallet = new ethers.Wallet(key, this.provider);
    } else if (config.mnemonic) {
      const hdNode = ethers.HDNodeWallet.fromPhrase(
        config.mnemonic,
        undefined,
        config.derivationPath || "m/44'/60'/0'/0/0",
      );
      this.wallet = new ethers.Wallet(hdNode.privateKey, this.provider);
    } else {
      throw new Error('Either privateKey or mnemonic must be provided');
    }

    const addresses = getContractAddresses(config.network);

    this.contracts = {
      ipAssetRegistry: new ethers.Contract(
        addresses.ipAssetRegistry,
        IP_ASSET_REGISTRY_ABI,
        this.wallet,
      ),
      licensingModule: new ethers.Contract(
        addresses.licensingModule,
        LICENSING_MODULE_ABI,
        this.wallet,
      ),
      royaltyModule: new ethers.Contract(
        addresses.royaltyModule,
        ROYALTY_MODULE_ABI,
        this.wallet,
      ),
      disputeModule: new ethers.Contract(
        addresses.disputeModule,
        DISPUTE_MODULE_ABI,
        this.wallet,
      ),
      pilTemplate: new ethers.Contract(addresses.pilTemplate, PIL_TEMPLATE_ABI, this.wallet),
    };
  }

  getWalletAddress(): string {
    return this.wallet.address;
  }

  getNetwork(): NetworkId {
    return this.network;
  }

  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  getSigner(): ethers.Wallet {
    return this.wallet;
  }

  // IP Asset operations
  async registerIpAsset(
    tokenContract: string,
    tokenId: string,
    chainId?: number,
  ): Promise<TransactionResult> {
    const networkConfig = getNetworkConfig(this.network);
    const targetChainId = chainId || networkConfig.chainId;

    const tx = await this.contracts.ipAssetRegistry.register(
      targetChainId,
      tokenContract,
      tokenId,
    );
    return this.processTransaction(tx);
  }

  async getIpId(tokenContract: string, tokenId: string, chainId?: number): Promise<string> {
    const networkConfig = getNetworkConfig(this.network);
    const targetChainId = chainId || networkConfig.chainId;

    return await this.contracts.ipAssetRegistry.ipId(targetChainId, tokenContract, tokenId);
  }

  async isIpRegistered(ipId: string): Promise<boolean> {
    return await this.contracts.ipAssetRegistry.isRegistered(ipId);
  }

  async getTotalIpAssets(): Promise<string> {
    const total = await this.contracts.ipAssetRegistry.totalSupply();
    return total.toString();
  }

  // Licensing operations
  async attachLicenseTerms(
    ipId: string,
    licenseTemplate: string,
    licenseTermsId: number,
  ): Promise<TransactionResult> {
    const tx = await this.contracts.licensingModule.attachLicenseTerms(
      ipId,
      licenseTemplate,
      licenseTermsId,
    );
    return this.processTransaction(tx);
  }

  async mintLicenseTokens(
    licensorIpId: string,
    licenseTemplate: string,
    licenseTermsId: number,
    amount: number,
    receiver: string,
    royaltyContext: string = '0x',
  ): Promise<TransactionResult> {
    const tx = await this.contracts.licensingModule.mintLicenseTokens(
      licensorIpId,
      licenseTemplate,
      licenseTermsId,
      amount,
      receiver,
      royaltyContext,
    );
    return this.processTransaction(tx);
  }

  async registerDerivative(
    childIpId: string,
    parentIpIds: string[],
    licenseTermsIds: number[],
    licenseTemplate: string,
    royaltyContext: string = '0x',
  ): Promise<TransactionResult> {
    const tx = await this.contracts.licensingModule.registerDerivative(
      childIpId,
      parentIpIds,
      licenseTermsIds,
      licenseTemplate,
      royaltyContext,
    );
    return this.processTransaction(tx);
  }

  async registerDerivativeWithLicenseTokens(
    childIpId: string,
    licenseTokenIds: number[],
    royaltyContext: string = '0x',
  ): Promise<TransactionResult> {
    const tx = await this.contracts.licensingModule.registerDerivativeWithLicenseTokens(
      childIpId,
      licenseTokenIds,
      royaltyContext,
    );
    return this.processTransaction(tx);
  }

  // PIL Template operations
  async registerPILTerms(terms: {
    transferable: boolean;
    royaltyPolicy: string;
    defaultMintingFee: string;
    expiration: number;
    commercialUse: boolean;
    commercialAttribution: boolean;
    commercializerChecker: string;
    commercializerCheckerData: string;
    commercialRevShare: number;
    commercialRevCeiling: string;
    derivativesAllowed: boolean;
    derivativesAttribution: boolean;
    derivativesApproval: boolean;
    derivativesReciprocal: boolean;
    derivativeRevCeiling: string;
    currency: string;
    uri: string;
  }): Promise<TransactionResult> {
    const tx = await this.contracts.pilTemplate.registerLicenseTerms(terms);
    return this.processTransaction(tx);
  }

  async getPILTerms(licenseTermsId: number): Promise<Record<string, unknown>> {
    return await this.contracts.pilTemplate.getLicenseTerms(licenseTermsId);
  }

  // Royalty operations
  async payRoyalty(
    receiverIpId: string,
    payerIpId: string,
    token: string,
    amount: string,
  ): Promise<TransactionResult> {
    const tx = await this.contracts.royaltyModule.payRoyaltyOnBehalf(
      receiverIpId,
      payerIpId,
      token,
      amount,
    );
    return this.processTransaction(tx);
  }

  async getClaimableRevenue(
    ipId: string,
    ancestorIpId: string,
    token: string,
  ): Promise<string> {
    const revenue = await this.contracts.royaltyModule.claimableRevenue(
      ipId,
      ancestorIpId,
      token,
    );
    return revenue.toString();
  }

  async claimRevenue(
    snapshotIds: string[],
    ipId: string,
    ancestorIpId: string,
    token: string,
  ): Promise<TransactionResult> {
    const tx = await this.contracts.royaltyModule.claimRevenue(
      snapshotIds,
      ipId,
      ancestorIpId,
      token,
    );
    return this.processTransaction(tx);
  }

  // Dispute operations
  async raiseDispute(
    targetIpId: string,
    evidenceLink: string,
    targetTag: string,
    data: string = '0x',
  ): Promise<TransactionResult> {
    const tagBytes = ethers.encodeBytes32String(targetTag);
    const tx = await this.contracts.disputeModule.raiseDispute(
      targetIpId,
      evidenceLink,
      tagBytes,
      data,
    );
    return this.processTransaction(tx);
  }

  async cancelDispute(disputeId: number, data: string = '0x'): Promise<TransactionResult> {
    const tx = await this.contracts.disputeModule.cancelDispute(disputeId, data);
    return this.processTransaction(tx);
  }

  async resolveDispute(disputeId: number, data: string = '0x'): Promise<TransactionResult> {
    const tx = await this.contracts.disputeModule.resolveDispute(disputeId, data);
    return this.processTransaction(tx);
  }

  // Event listening
  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  async getEvents(
    contract: 'ipAssetRegistry' | 'licensingModule' | 'royaltyModule' | 'disputeModule',
    eventName: string,
    fromBlock: number,
    toBlock: number | 'latest',
  ): Promise<ethers.Log[]> {
    const contractInstance = this.contracts[contract];
    const filter = contractInstance.filters[eventName]();
    return await contractInstance.queryFilter(filter, fromBlock, toBlock);
  }

  // Helper methods
  private async processTransaction(
    tx: ethers.ContractTransactionResponse,
  ): Promise<TransactionResult> {
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error('Transaction receipt is null');
    }

    const events: EventLog[] = receipt.logs
      .map((log) => {
        try {
          // Try to parse log with each contract
          for (const contract of Object.values(this.contracts)) {
            try {
              const parsed = contract.interface.parseLog({
                topics: log.topics as string[],
                data: log.data,
              });
              if (parsed) {
                return {
                  name: parsed.name,
                  args: Object.fromEntries(
                    parsed.fragment.inputs.map((input, i) => [
                      input.name,
                      parsed.args[i]?.toString() ?? parsed.args[i],
                    ]),
                  ),
                };
              }
            } catch {
              continue;
            }
          }
          return null;
        } catch {
          return null;
        }
      })
      .filter((e): e is EventLog => e !== null);

    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status === 1,
      gasUsed: receipt.gasUsed.toString(),
      events,
    };
  }

  // Utility methods
  static formatAddress(address: string): string {
    return ethers.getAddress(address);
  }

  static isValidAddress(address: string): boolean {
    try {
      ethers.getAddress(address);
      return true;
    } catch {
      return false;
    }
  }

  static parseEther(value: string): string {
    return ethers.parseEther(value).toString();
  }

  static formatEther(value: string): string {
    return ethers.formatEther(value);
  }
}

export async function getStoryClient(
  context: IExecuteFunctions | ILoadOptionsFunctions,
  credentialName = 'storyProtocol',
): Promise<StoryClient> {
  const credentials = await context.getCredentials(credentialName);

  if (!credentials) {
    throw new NodeOperationError(
      context.getNode(),
      'No credentials provided for Story Protocol',
    );
  }

  const config: StoryClientConfig = {
    network: credentials.network as NetworkId,
    rpcUrl: credentials.rpcUrl as string | undefined,
  };

  if (credentials.authMethod === 'privateKey') {
    config.privateKey = credentials.privateKey as string;
  } else {
    config.mnemonic = credentials.mnemonic as string;
    config.derivationPath = credentials.derivationPath as string;
  }

  return new StoryClient(config);
}
