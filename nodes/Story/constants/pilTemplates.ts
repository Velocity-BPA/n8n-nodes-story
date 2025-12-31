/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export enum PILLicenseType {
  NON_COMMERCIAL_SOCIAL_REMIXING = 'non_commercial_social_remixing',
  COMMERCIAL_USE = 'commercial_use',
  COMMERCIAL_REMIX = 'commercial_remix',
  CUSTOM = 'custom',
}

export interface PILTerms {
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
}

export const DEFAULT_PIL_TERMS: PILTerms = {
  transferable: true,
  royaltyPolicy: '0x0000000000000000000000000000000000000000',
  defaultMintingFee: '0',
  expiration: 0,
  commercialUse: false,
  commercialAttribution: false,
  commercializerChecker: '0x0000000000000000000000000000000000000000',
  commercializerCheckerData: '0x',
  commercialRevShare: 0,
  commercialRevCeiling: '0',
  derivativesAllowed: true,
  derivativesAttribution: true,
  derivativesApproval: false,
  derivativesReciprocal: true,
  derivativeRevCeiling: '0',
  currency: '0x0000000000000000000000000000000000000000',
  uri: '',
};

export interface PILTemplate {
  id: string;
  name: string;
  description: string;
  type: PILLicenseType;
  terms: Partial<PILTerms>;
}

export const PIL_TEMPLATES: Record<PILLicenseType, PILTemplate> = {
  [PILLicenseType.NON_COMMERCIAL_SOCIAL_REMIXING]: {
    id: 'non_commercial_social_remixing',
    name: 'Non-Commercial Social Remixing',
    description:
      'Allows free use and remixing for non-commercial purposes with attribution required',
    type: PILLicenseType.NON_COMMERCIAL_SOCIAL_REMIXING,
    terms: {
      transferable: true,
      commercialUse: false,
      commercialAttribution: false,
      commercialRevShare: 0,
      derivativesAllowed: true,
      derivativesAttribution: true,
      derivativesApproval: false,
      derivativesReciprocal: true,
    },
  },
  [PILLicenseType.COMMERCIAL_USE]: {
    id: 'commercial_use',
    name: 'Commercial Use',
    description: 'Allows commercial use with revenue sharing but no derivative works',
    type: PILLicenseType.COMMERCIAL_USE,
    terms: {
      transferable: true,
      commercialUse: true,
      commercialAttribution: true,
      commercialRevShare: 10,
      derivativesAllowed: false,
      derivativesAttribution: false,
      derivativesApproval: false,
      derivativesReciprocal: false,
    },
  },
  [PILLicenseType.COMMERCIAL_REMIX]: {
    id: 'commercial_remix',
    name: 'Commercial Remix',
    description: 'Allows commercial use and derivative works with revenue sharing',
    type: PILLicenseType.COMMERCIAL_REMIX,
    terms: {
      transferable: true,
      commercialUse: true,
      commercialAttribution: true,
      commercialRevShare: 15,
      derivativesAllowed: true,
      derivativesAttribution: true,
      derivativesApproval: false,
      derivativesReciprocal: true,
    },
  },
  [PILLicenseType.CUSTOM]: {
    id: 'custom',
    name: 'Custom Terms',
    description: 'Define your own custom license terms',
    type: PILLicenseType.CUSTOM,
    terms: {},
  },
};

export const DEFAULT_ROYALTY_RATES = {
  minRate: 0,
  maxRate: 100,
  defaultRate: 10,
};

export const SUPPORTED_CURRENCIES = [
  {
    symbol: 'IP',
    name: 'IP Token',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    isNative: true,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86a33E6417e8F0C5f3e6b8e5e5c5d5f5g5h5i', // Placeholder
    decimals: 6,
    isNative: false,
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0xB1c97a44E6517e8F1C6f4e7b9e6e6d6e6f6g6h6j', // Placeholder
    decimals: 6,
    isNative: false,
  },
];

export function getPILTemplate(type: PILLicenseType): PILTemplate {
  const template = PIL_TEMPLATES[type];
  if (!template) {
    throw new Error(`Unknown PIL license type: ${type}`);
  }
  return template;
}

export function buildPILTerms(
  templateType: PILLicenseType,
  overrides: Partial<PILTerms> = {},
): PILTerms {
  const template = getPILTemplate(templateType);
  return {
    ...DEFAULT_PIL_TERMS,
    ...template.terms,
    ...overrides,
  };
}

export function validatePILTerms(terms: PILTerms): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Story Protocol uses basis points: 100 = 1%, 10000 = 100%
  if (terms.commercialRevShare < 0 || terms.commercialRevShare > 10000) {
    errors.push('Commercial revenue share must be between 0 and 10000 basis points');
  }

  if (terms.commercialUse && !terms.royaltyPolicy) {
    errors.push('Royalty policy is required for commercial use');
  }

  if (terms.derivativesAllowed && terms.derivativesApproval && !terms.derivativesAttribution) {
    errors.push('Derivatives attribution is recommended when approval is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
