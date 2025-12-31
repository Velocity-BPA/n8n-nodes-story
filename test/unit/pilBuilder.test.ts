/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { PILBuilder } from '../../nodes/Story/helpers/pilBuilder';
import {
  PILLicenseType,
  PIL_TEMPLATES,
  DEFAULT_PIL_TERMS,
  validatePILTerms,
} from '../../nodes/Story/constants/pilTemplates';

describe('PILBuilder', () => {
  describe('constructor', () => {
    it('should create builder with default terms', () => {
      const builder = new PILBuilder();
      const terms = builder.build();
      
      expect(terms).toBeDefined();
      expect(terms.transferable).toBe(true);
      expect(terms.commercialUse).toBe(false);
      expect(terms.derivativesAllowed).toBe(true);
    });
  });

  describe('fromTemplate', () => {
    it('should create non-commercial social remixing template', () => {
      const builder = PILBuilder.fromTemplate(PILLicenseType.NON_COMMERCIAL_SOCIAL_REMIXING);
      const terms = builder.build();
      
      expect(terms.commercialUse).toBe(false);
      expect(terms.derivativesAllowed).toBe(true);
    });

    it('should create commercial use template', () => {
      const builder = PILBuilder.fromTemplate(PILLicenseType.COMMERCIAL_USE);
      const terms = builder.build();
      
      expect(terms.commercialUse).toBe(true);
    });

    it('should create commercial remix template', () => {
      const builder = PILBuilder.fromTemplate(PILLicenseType.COMMERCIAL_REMIX);
      const terms = builder.build();
      
      expect(terms.commercialUse).toBe(true);
      expect(terms.derivativesAllowed).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set transferable', () => {
      const builder = new PILBuilder();
      builder.setTransferable(false);
      const terms = builder.build();
      
      expect(terms.transferable).toBe(false);
    });

    it('should set commercial use', () => {
      const builder = new PILBuilder();
      builder.setCommercialUse(true);
      const terms = builder.build();
      
      expect(terms.commercialUse).toBe(true);
    });

    it('should set commercial revenue share', () => {
      const builder = new PILBuilder();
      builder.setCommercialRevShare(1000); // 10%
      const terms = builder.build();
      
      expect(terms.commercialRevShare).toBe(1000);
    });

    it('should set derivatives allowed', () => {
      const builder = new PILBuilder();
      builder.setDerivativesAllowed(false);
      const terms = builder.build();
      
      expect(terms.derivativesAllowed).toBe(false);
    });

    it('should chain setters', () => {
      const builder = new PILBuilder()
        .setCommercialUse(true)
        .setCommercialRevShare(500)
        .setDerivativesAllowed(true)
        .setTransferable(true);
      
      const terms = builder.build();
      
      expect(terms.commercialUse).toBe(true);
      expect(terms.commercialRevShare).toBe(500);
      expect(terms.derivativesAllowed).toBe(true);
      expect(terms.transferable).toBe(true);
    });
  });
});

describe('PIL Templates', () => {
  it('should have all license types defined', () => {
    expect(PIL_TEMPLATES[PILLicenseType.NON_COMMERCIAL_SOCIAL_REMIXING]).toBeDefined();
    expect(PIL_TEMPLATES[PILLicenseType.COMMERCIAL_USE]).toBeDefined();
    expect(PIL_TEMPLATES[PILLicenseType.COMMERCIAL_REMIX]).toBeDefined();
    expect(PIL_TEMPLATES[PILLicenseType.CUSTOM]).toBeDefined();
  });

  it('should have default PIL terms', () => {
    expect(DEFAULT_PIL_TERMS).toBeDefined();
    expect(DEFAULT_PIL_TERMS.transferable).toBeDefined();
    expect(DEFAULT_PIL_TERMS.commercialUse).toBeDefined();
  });
});

describe('validatePILTerms', () => {
  it('should validate correct terms', () => {
    const terms = {
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

    const result = validatePILTerms(terms);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid revenue share', () => {
    const terms = {
      ...DEFAULT_PIL_TERMS,
      commercialRevShare: 15000, // > 10000 basis points (100%)
    };

    const result = validatePILTerms(terms);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
