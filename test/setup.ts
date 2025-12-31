/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

// Jest test setup

// Mock n8n-workflow module
jest.mock('n8n-workflow', () => ({
  NodeOperationError: class NodeOperationError extends Error {
    constructor(_node: unknown, message: string, _options?: { itemIndex?: number }) {
      super(message);
      this.name = 'NodeOperationError';
    }
  },
  NodeConnectionType: {
    Main: 'main',
  },
}));

// Set test timeout
jest.setTimeout(30000);

// Global test utilities
global.console = {
  ...console,
  // Suppress console.warn during tests unless specifically needed
  warn: jest.fn(),
};
