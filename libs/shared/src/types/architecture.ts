/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

import { BranchLikeParameters } from './branch-like';

export type NodeType = 'group' | 'file';

export type Edge = {
  to_id: number;
  weight: number;
};

export type Node = GroupNode | FileNode;
export type GroupNode = {
  id: number;
  name: string;
  nodes: Node[];
  type: 'group';
};
export type FileNode = {
  base_id?: number;
  edges: Edge[];
  id: number;
  name: string;
  type: 'file';
};
export type FlattenedNode = (FileNode | GroupNode) & { parentId?: number };

export type ApiData = {
  name?: string;
  nodes: Node[];
  // this is temporarily relevant to skip flattening when receiving file-graphs
  source?: 'perspective' | 'file-graph';
};

/**
 * The data passed from the architecture main thread to the worker
 * that computes the nodes, edges and their positions.
 */
export type WorkerMessage = {
  apiData: ApiData;
  detailsLevel?: number;
  expandedNodeIds?: Set<number>;
};

/**
 * The data passed from the architecture main thread to the worker
 * that computes the nodes, edges and their positions.
 */
export type TangleWorkerMessage = {
  apiData: ApiData;
  detailsLevel?: number;
  tangleNodeIds?: Set<number>;
};

export type GetArchitectureFileGraphParams = {
  projectKey: string;
  source?: string;
} & BranchLikeParameters;

export const DNA_SUPPORTED_LANGUAGES = ['java', 'js', 'ts', 'py', 'cs'];
