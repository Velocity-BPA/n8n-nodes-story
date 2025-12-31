/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { PILTerms, DEFAULT_PIL_TERMS, PILLicenseType, buildPILTerms } from '../constants';

export interface PILBuilderOptions {
  // Basic settings
  transferable?: boolean;
  expiration?: number;

  // Commercial settings
  commercialUse?: boolean;
  commercialAttribution?: boolean;
  commercialRevShare?: number;
  commercialRevCeiling?: string;
  commercializerChecker?: string;
  commercializerCheckerData?: string;

  // Derivative settings
  derivativesAllowed?: boolean;
  derivativesAttribution?: boolean;
  derivativesApproval?: boolean;
  derivativesReciprocal?: boolean;
  derivativeRevCeiling?: string;

  // Payment settings
  royaltyPolicy?: string;
  defaultMintingFee?: string;
  currency?: string;

  // Metadata
  uri?: string;
}

export class PILBuilder {
  private terms: PILTerms;

  constructor(baseType: PILLicenseType = PILLicenseType.NON_COMMERCIAL_SOCIAL_REMIXING) {
    this.terms = buildPILTerms(baseType);
  }

  static fromTemplate(type: PILLicenseType): PILBuilder {
    return new PILBuilder(type);
  }

  static custom(): PILBuilder {
    return new PILBuilder(PILLicenseType.CUSTOM);
  }

  setTransferable(transferable: boolean): PILBuilder {
    this.terms.transferable = transferable;
    return this;
  }

  setExpiration(expiration: number): PILBuilder {
    this.terms.expiration = expiration;
    return this;
  }

  setCommercialUse(enabled: boolean): PILBuilder {
    this.terms.commercialUse = enabled;
    return this;
  }

  setCommercialAttribution(required: boolean): PILBuilder {
    this.terms.commercialAttribution = required;
    return this;
  }

  setCommercialRevShare(basisPoints: number): PILBuilder {
    // Story Protocol uses basis points: 100 = 1%, 10000 = 100%
    if (basisPoints < 0 || basisPoints > 10000) {
      throw new Error('Revenue share must be between 0 and 10000 basis points');
    }
    this.terms.commercialRevShare = basisPoints;
    return this;
  }

  setCommercialRevCeiling(ceiling: string): PILBuilder {
    this.terms.commercialRevCeiling = ceiling;
    return this;
  }

  setCommercializerChecker(address: string, data: string = '0x'): PILBuilder {
    this.terms.commercializerChecker = address;
    this.terms.commercializerCheckerData = data;
    return this;
  }

  setDerivativesAllowed(allowed: boolean): PILBuilder {
    this.terms.derivativesAllowed = allowed;
    return this;
  }

  setDerivativesAttribution(required: boolean): PILBuilder {
    this.terms.derivativesAttribution = required;
    return this;
  }

  setDerivativesApproval(required: boolean): PILBuilder {
    this.terms.derivativesApproval = required;
    return this;
  }

  setDerivativesReciprocal(required: boolean): PILBuilder {
    this.terms.derivativesReciprocal = required;
    return this;
  }

  setDerivativeRevCeiling(ceiling: string): PILBuilder {
    this.terms.derivativeRevCeiling = ceiling;
    return this;
  }

  setRoyaltyPolicy(policyAddress: string): PILBuilder {
    this.terms.royaltyPolicy = policyAddress;
    return this;
  }

  setDefaultMintingFee(fee: string): PILBuilder {
    this.terms.defaultMintingFee = fee;
    return this;
  }

  setCurrency(currencyAddress: string): PILBuilder {
    this.terms.currency = currencyAddress;
    return this;
  }

  setUri(uri: string): PILBuilder {
    this.terms.uri = uri;
    return this;
  }

  withOptions(options: PILBuilderOptions): PILBuilder {
    if (options.transferable !== undefined) this.setTransferable(options.transferable);
    if (options.expiration !== undefined) this.setExpiration(options.expiration);
    if (options.commercialUse !== undefined) this.setCommercialUse(options.commercialUse);
    if (options.commercialAttribution !== undefined)
      this.setCommercialAttribution(options.commercialAttribution);
    if (options.commercialRevShare !== undefined)
      this.setCommercialRevShare(options.commercialRevShare);
    if (options.commercialRevCeiling !== undefined)
      this.setCommercialRevCeiling(options.commercialRevCeiling);
    if (options.commercializerChecker !== undefined)
      this.setCommercializerChecker(
        options.commercializerChecker,
        options.commercializerCheckerData,
      );
    if (options.derivativesAllowed !== undefined)
      this.setDerivativesAllowed(options.derivativesAllowed);
    if (options.derivativesAttribution !== undefined)
      this.setDerivativesAttribution(options.derivativesAttribution);
    if (options.derivativesApproval !== undefined)
      this.setDerivativesApproval(options.derivativesApproval);
    if (options.derivativesReciprocal !== undefined)
      this.setDerivativesReciprocal(options.derivativesReciprocal);
    if (options.derivativeRevCeiling !== undefined)
      this.setDerivativeRevCeiling(options.derivativeRevCeiling);
    if (options.royaltyPolicy !== undefined) this.setRoyaltyPolicy(options.royaltyPolicy);
    if (options.defaultMintingFee !== undefined)
      this.setDefaultMintingFee(options.defaultMintingFee);
    if (options.currency !== undefined) this.setCurrency(options.currency);
    if (options.uri !== undefined) this.setUri(options.uri);
    return this;
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Story Protocol uses basis points: 100 = 1%, 10000 = 100%
    if (this.terms.commercialRevShare < 0 || this.terms.commercialRevShare > 10000) {
      errors.push('Commercial revenue share must be between 0 and 10000 basis points');
    }

    if (
      this.terms.commercialUse &&
      this.terms.royaltyPolicy === DEFAULT_PIL_TERMS.royaltyPolicy
    ) {
      errors.push('Royalty policy should be set for commercial use licenses');
    }

    if (this.terms.commercialUse && this.terms.commercialRevShare > 0) {
      if (this.terms.currency === DEFAULT_PIL_TERMS.currency) {
        errors.push('Currency should be specified when revenue share is set');
      }
    }

    if (this.terms.derivativesAllowed && this.terms.derivativesApproval) {
      if (!this.terms.derivativesAttribution) {
        errors.push('Attribution is recommended when derivative approval is required');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  build(): PILTerms {
    const validation = this.validate();
    if (!validation.valid) {
      // Log warnings but don't throw
      validation.errors.forEach((error) => {
        // eslint-disable-next-line no-console
        console.warn(`PIL Terms Warning: ${error}`);
      });
    }
    return { ...this.terms };
  }

  toJSON(): Record<string, unknown> {
    return { ...this.terms };
  }
}

// Utility functions for PIL term formatting
export function formatPILTermsForDisplay(terms: PILTerms): Record<string, string> {
  return {
    'Transferable': terms.transferable ? 'Yes' : 'No',
    'Commercial Use': terms.commercialUse ? 'Allowed' : 'Not Allowed',
    'Commercial Attribution': terms.commercialAttribution ? 'Required' : 'Not Required',
    'Revenue Share': `${terms.commercialRevShare}%`,
    'Derivatives Allowed': terms.derivativesAllowed ? 'Yes' : 'No',
    'Derivatives Attribution': terms.derivativesAttribution ? 'Required' : 'Not Required',
    'Derivatives Approval': terms.derivativesApproval ? 'Required' : 'Not Required',
    'Reciprocal License': terms.derivativesReciprocal ? 'Yes' : 'No',
    'Minting Fee': terms.defaultMintingFee || '0',
    'Expiration': terms.expiration === 0 ? 'Never' : new Date(terms.expiration * 1000).toISOString(),
  };
}

export function parsePILTermsFromParams(params: Record<string, unknown>): Partial<PILTerms> {
  const terms: Partial<PILTerms> = {};

  if (params.transferable !== undefined) terms.transferable = Boolean(params.transferable);
  if (params.expiration !== undefined) terms.expiration = Number(params.expiration);
  if (params.commercialUse !== undefined) terms.commercialUse = Boolean(params.commercialUse);
  if (params.commercialAttribution !== undefined)
    terms.commercialAttribution = Boolean(params.commercialAttribution);
  if (params.commercialRevShare !== undefined)
    terms.commercialRevShare = Number(params.commercialRevShare);
  if (params.commercialRevCeiling !== undefined)
    terms.commercialRevCeiling = String(params.commercialRevCeiling);
  if (params.derivativesAllowed !== undefined)
    terms.derivativesAllowed = Boolean(params.derivativesAllowed);
  if (params.derivativesAttribution !== undefined)
    terms.derivativesAttribution = Boolean(params.derivativesAttribution);
  if (params.derivativesApproval !== undefined)
    terms.derivativesApproval = Boolean(params.derivativesApproval);
  if (params.derivativesReciprocal !== undefined)
    terms.derivativesReciprocal = Boolean(params.derivativesReciprocal);
  if (params.derivativeRevCeiling !== undefined)
    terms.derivativeRevCeiling = String(params.derivativeRevCeiling);
  if (params.royaltyPolicy !== undefined) terms.royaltyPolicy = String(params.royaltyPolicy);
  if (params.defaultMintingFee !== undefined)
    terms.defaultMintingFee = String(params.defaultMintingFee);
  if (params.currency !== undefined) terms.currency = String(params.currency);
  if (params.uri !== undefined) terms.uri = String(params.uri);

  return terms;
}
