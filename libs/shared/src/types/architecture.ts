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

import { Edge as ReactFlowEdge, Node as ReactFlowNode } from '@xyflow/react';
import { BranchLikeParameters } from './branch-like';

export type Edge = {
  to_id: number;
  weight: number;
};

export type Node = {
  edges: Edge[];
  id: number;
  name: string;
};

export type FileSliceGraph = {
  name: string;
  nodes: Node[];
};

export type GetArchitectureFileGraphParams = {
  projectKey: string;
  source?: string;
} & BranchLikeParameters;

export const DNA_SUPPORTED_LANGUAGES = ['java', 'js', 'ts', 'py', 'cs'];

// Define the types for the data exchanged between the main thread and the worker
export interface ArchitectureWorkerDataIn {
  edges: ReactFlowEdge[];
  nodes: ReactFlowNode[];
}

export interface ArchitectureWorkerDataOut {
  edges: ReactFlowEdge[];
  nodes: ReactFlowNode[];
  progress: number;
  type: string;
}
