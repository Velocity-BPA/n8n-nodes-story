/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  LineageParser,
  formatLineageForDisplay,
  validateDerivativeChain,
} from '../../nodes/Story/helpers/lineageParser';

describe('LineageParser', () => {
  let parser: LineageParser;

  beforeEach(() => {
    parser = new LineageParser();
  });

  describe('addRelationship', () => {
    it('should add parent-child relationship', () => {
      parser.addRelationship('child1', ['parent1']);
      
      const descendants = parser.getDescendants('parent1');
      expect(descendants).toContain('child1');
    });

    it('should handle multiple children', () => {
      parser.addRelationship('child1', ['parent1']);
      parser.addRelationship('child2', ['parent1']);
      
      const descendants = parser.getDescendants('parent1');
      expect(descendants).toContain('child1');
      expect(descendants).toContain('child2');
    });
  });

  describe('getAncestors', () => {
    it('should return empty array for root IP', () => {
      parser.addRelationship('child', ['root']);
      
      const ancestors = parser.getAncestors('root');
      expect(ancestors).toEqual([]);
    });

    it('should return parent for child IP', () => {
      parser.addRelationship('child', ['parent']);
      
      const ancestors = parser.getAncestors('child');
      expect(ancestors).toContain('parent');
    });

    it('should return all ancestors recursively', () => {
      parser.addRelationship('parent', ['grandparent']);
      parser.addRelationship('child', ['parent']);
      
      const ancestors = parser.getAncestors('child');
      expect(ancestors).toContain('parent');
      expect(ancestors).toContain('grandparent');
    });
  });

  describe('getDescendants', () => {
    it('should return empty array for leaf IP', () => {
      parser.addRelationship('child', ['parent']);
      
      const descendants = parser.getDescendants('child');
      expect(descendants).toEqual([]);
    });

    it('should return children', () => {
      parser.addRelationship('child', ['parent']);
      
      const descendants = parser.getDescendants('parent');
      expect(descendants).toContain('child');
    });

    it('should return all descendants recursively', () => {
      parser.addRelationship('parent', ['grandparent']);
      parser.addRelationship('child', ['parent']);
      
      const descendants = parser.getDescendants('grandparent');
      expect(descendants).toContain('parent');
      expect(descendants).toContain('child');
    });
  });

  describe('findPath', () => {
    it('should return null for unconnected IPs', () => {
      parser.addRelationship('b', ['a']);
      parser.addRelationship('d', ['c']);
      
      const path = parser.findPath('a', 'd');
      expect(path).toBeNull();
    });

    it('should find direct path', () => {
      parser.addRelationship('child', ['parent']);
      
      const pathResult = parser.findPath('parent', 'child');
      expect(pathResult).not.toBeNull();
      expect(pathResult?.path).toEqual(['parent', 'child']);
    });

    it('should find multi-level path', () => {
      parser.addRelationship('parent', ['grandparent']);
      parser.addRelationship('child', ['parent']);
      
      const pathResult = parser.findPath('grandparent', 'child');
      expect(pathResult).not.toBeNull();
      expect(pathResult?.path).toEqual(['grandparent', 'parent', 'child']);
    });
  });

  describe('isAncestor', () => {
    it('should return true for direct parent', () => {
      parser.addRelationship('child', ['parent']);
      
      expect(parser.isAncestor('parent', 'child')).toBe(true);
    });

    it('should return true for indirect ancestor', () => {
      parser.addRelationship('parent', ['grandparent']);
      parser.addRelationship('child', ['parent']);
      
      expect(parser.isAncestor('grandparent', 'child')).toBe(true);
    });

    it('should return false for non-ancestor', () => {
      parser.addRelationship('child', ['parent']);
      
      expect(parser.isAncestor('child', 'parent')).toBe(false);
    });
  });

  describe('buildTree', () => {
    it('should build tree structure', () => {
      parser.addRelationship('child1', ['root']);
      parser.addRelationship('child2', ['root']);
      parser.addRelationship('grandchild1', ['child1']);
      
      const tree = parser.buildTree('root');
      
      expect(tree).not.toBeNull();
      expect(tree?.root).toBe('root');
      expect(tree?.totalNodes).toBe(4);
    });
  });
});

describe('formatLineageForDisplay', () => {
  it('should format lineage data', () => {
    const parser = new LineageParser();
    parser.addRelationship('child1', ['parent1']);
    parser.addRelationship('grandchild1', ['child1']);
    
    const formatted = formatLineageForDisplay(parser);
    
    expect(formatted.length).toBeGreaterThan(0);
    expect(formatted.join('\n')).toContain('parent1');
    expect(formatted.join('\n')).toContain('child1');
  });
});

describe('validateDerivativeChain', () => {
  it('should validate valid chain', () => {
    const parser = new LineageParser();
    parser.addRelationship('child', ['root']);
    parser.addRelationship('grandchild', ['child']);
    
    const result = validateDerivativeChain(parser, 'grandchild', 'root');
    
    expect(result.valid).toBe(true);
    expect(result.path.length).toBeGreaterThan(0);
  });

  it('should reject non-existent chain', () => {
    const parser = new LineageParser();
    parser.addRelationship('child', ['root']);
    
    const result = validateDerivativeChain(parser, 'nonexistent', 'root');
    
    expect(result.valid).toBe(false);
  });
});
