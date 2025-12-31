/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export interface LineageNode {
  ipId: string;
  parents: string[];
  children: string[];
  depth: number;
  isRoot: boolean;
  isLeaf: boolean;
}

export interface LineageTree {
  root: string;
  nodes: Map<string, LineageNode>;
  maxDepth: number;
  totalNodes: number;
}

export interface LineagePath {
  from: string;
  to: string;
  path: string[];
  depth: number;
}

export class LineageParser {
  private nodes: Map<string, LineageNode>;
  private roots: Set<string>;

  constructor() {
    this.nodes = new Map();
    this.roots = new Set();
  }

  addRelationship(childIpId: string, parentIpIds: string[]): void {
    // Ensure child node exists
    if (!this.nodes.has(childIpId)) {
      this.nodes.set(childIpId, {
        ipId: childIpId,
        parents: [],
        children: [],
        depth: 0,
        isRoot: false,
        isLeaf: true,
      });
    }

    const childNode = this.nodes.get(childIpId)!;

    // Add parent relationships
    for (const parentIpId of parentIpIds) {
      // Ensure parent node exists
      if (!this.nodes.has(parentIpId)) {
        this.nodes.set(parentIpId, {
          ipId: parentIpId,
          parents: [],
          children: [],
          depth: 0,
          isRoot: true,
          isLeaf: false,
        });
        this.roots.add(parentIpId);
      }

      const parentNode = this.nodes.get(parentIpId)!;

      // Add relationship
      if (!childNode.parents.includes(parentIpId)) {
        childNode.parents.push(parentIpId);
      }
      if (!parentNode.children.includes(childIpId)) {
        parentNode.children.push(childIpId);
      }

      // Update leaf/root status
      parentNode.isLeaf = false;
      childNode.isRoot = false;
      this.roots.delete(childIpId);
    }

    // Recalculate depths
    this.calculateDepths();
  }

  private calculateDepths(): void {
    // BFS from roots to calculate depths
    const visited = new Set<string>();
    const queue: { ipId: string; depth: number }[] = [];

    // Start from roots
    for (const root of this.roots) {
      queue.push({ ipId: root, depth: 0 });
    }

    while (queue.length > 0) {
      const { ipId, depth } = queue.shift()!;

      if (visited.has(ipId)) continue;
      visited.add(ipId);

      const node = this.nodes.get(ipId);
      if (node) {
        node.depth = depth;
        for (const child of node.children) {
          queue.push({ ipId: child, depth: depth + 1 });
        }
      }
    }
  }

  getNode(ipId: string): LineageNode | undefined {
    return this.nodes.get(ipId);
  }

  getAncestors(ipId: string): string[] {
    const ancestors: string[] = [];
    const visited = new Set<string>();
    const queue = [ipId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const node = this.nodes.get(current);

      if (node) {
        for (const parent of node.parents) {
          if (!visited.has(parent)) {
            visited.add(parent);
            ancestors.push(parent);
            queue.push(parent);
          }
        }
      }
    }

    return ancestors;
  }

  getDescendants(ipId: string): string[] {
    const descendants: string[] = [];
    const visited = new Set<string>();
    const queue = [ipId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const node = this.nodes.get(current);

      if (node) {
        for (const child of node.children) {
          if (!visited.has(child)) {
            visited.add(child);
            descendants.push(child);
            queue.push(child);
          }
        }
      }
    }

    return descendants;
  }

  findPath(fromIpId: string, toIpId: string): LineagePath | null {
    // BFS to find path
    const visited = new Set<string>();
    const queue: { ipId: string; path: string[] }[] = [{ ipId: fromIpId, path: [fromIpId] }];

    while (queue.length > 0) {
      const { ipId, path } = queue.shift()!;

      if (ipId === toIpId) {
        return {
          from: fromIpId,
          to: toIpId,
          path,
          depth: path.length - 1,
        };
      }

      if (visited.has(ipId)) continue;
      visited.add(ipId);

      const node = this.nodes.get(ipId);
      if (node) {
        // Check both parents and children
        for (const connected of [...node.parents, ...node.children]) {
          if (!visited.has(connected)) {
            queue.push({ ipId: connected, path: [...path, connected] });
          }
        }
      }
    }

    return null;
  }

  isAncestor(potentialAncestor: string, ipId: string): boolean {
    const ancestors = this.getAncestors(ipId);
    return ancestors.includes(potentialAncestor);
  }

  isDescendant(potentialDescendant: string, ipId: string): boolean {
    const descendants = this.getDescendants(ipId);
    return descendants.includes(potentialDescendant);
  }

  getRoots(): string[] {
    return Array.from(this.roots);
  }

  getLeaves(): string[] {
    const leaves: string[] = [];
    for (const [ipId, node] of this.nodes) {
      if (node.isLeaf) {
        leaves.push(ipId);
      }
    }
    return leaves;
  }

  getMaxDepth(): number {
    let maxDepth = 0;
    for (const node of this.nodes.values()) {
      if (node.depth > maxDepth) {
        maxDepth = node.depth;
      }
    }
    return maxDepth;
  }

  buildTree(rootIpId?: string): LineageTree | null {
    const root = rootIpId || Array.from(this.roots)[0];
    if (!root) return null;

    return {
      root,
      nodes: new Map(this.nodes),
      maxDepth: this.getMaxDepth(),
      totalNodes: this.nodes.size,
    };
  }

  toJSON(): Record<string, unknown> {
    const nodeArray: Record<string, unknown>[] = [];
    for (const [ipId, node] of this.nodes) {
      nodeArray.push({
        ipId,
        parents: node.parents,
        children: node.children,
        depth: node.depth,
        isRoot: node.isRoot,
        isLeaf: node.isLeaf,
      });
    }

    return {
      roots: Array.from(this.roots),
      nodes: nodeArray,
      maxDepth: this.getMaxDepth(),
      totalNodes: this.nodes.size,
    };
  }

  static fromApiResponse(data: {
    ancestors: string[];
    descendants: string[];
    tree: Record<string, string[]>;
  }): LineageParser {
    const parser = new LineageParser();

    // Build relationships from tree structure
    for (const [parent, children] of Object.entries(data.tree)) {
      for (const child of children) {
        parser.addRelationship(child, [parent]);
      }
    }

    return parser;
  }
}

// Utility functions
export function formatLineageForDisplay(lineage: LineageParser): string[] {
  const lines: string[] = [];
  const roots = lineage.getRoots();

  function printNode(ipId: string, indent: number): void {
    const prefix = '  '.repeat(indent);
    const node = lineage.getNode(ipId);
    if (node) {
      lines.push(`${prefix}├── ${ipId}`);
      for (const child of node.children) {
        printNode(child, indent + 1);
      }
    }
  }

  for (const root of roots) {
    lines.push(`Root: ${root}`);
    const node = lineage.getNode(root);
    if (node) {
      for (const child of node.children) {
        printNode(child, 1);
      }
    }
  }

  return lines;
}

export function validateDerivativeChain(
  lineage: LineageParser,
  childIpId: string,
  parentIpId: string,
): { valid: boolean; path: string[]; error?: string } {
  const node = lineage.getNode(childIpId);

  if (!node) {
    return {
      valid: false,
      path: [],
      error: `IP Asset ${childIpId} not found in lineage`,
    };
  }

  if (!node.parents.includes(parentIpId) && !lineage.isAncestor(parentIpId, childIpId)) {
    return {
      valid: false,
      path: [],
      error: `${parentIpId} is not a parent or ancestor of ${childIpId}`,
    };
  }

  const pathResult = lineage.findPath(parentIpId, childIpId);
  if (!pathResult) {
    return {
      valid: false,
      path: [],
      error: 'No valid path found between parent and child',
    };
  }

  return {
    valid: true,
    path: pathResult.path,
  };
}
