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

import { QGStatus } from '~shared/types/common';
import { MeasureEnhanced, Metric } from '~shared/types/measures';
import { MetricKey } from '~shared/types/metrics';
import { BranchLike } from './branch-like';
import { CaycStatus } from './types';
import { UserBase } from './users';

export interface QualityGateProjectStatus {
  caycStatus: CaycStatus;
  conditions?: QualityGateProjectStatusCondition[];
  ignoredConditions: boolean;
  status: QGStatus;
}

export interface QualityGateProjectStatusCondition {
  actualValue: string;
  comparator: string;
  errorThreshold: string;
  metricKey: string;
  periodIndex: number;
  status: QGStatus;
}

export interface QualityGateApplicationStatus {
  metrics: Metric[];
  projects: QualityGateApplicationStatusChildProject[];
  status: QGStatus;
}

export interface QualityGateApplicationStatusCondition {
  comparator: string;
  errorThreshold?: string;
  metric: string;
  onLeak?: boolean;
  periodIndex?: number;
  status: QGStatus;
  value: string;
  warningThreshold?: string;
}

export interface QualityGateApplicationStatusChildProject {
  caycStatus: CaycStatus;
  conditions: QualityGateApplicationStatusCondition[];
  key: string;
  name: string;
  status: QGStatus;
}

export interface QualityGateStatus {
  branchLike?: BranchLike;
  caycStatus: CaycStatus;
  conditions: QualityGateStatusConditionEnhanced[];
  failedConditions: QualityGateStatusConditionEnhanced[];
  ignoredConditions?: boolean;
  key: string;
  name: string;
  status: QGStatus;
}

export interface QualityGateStatusCondition {
  actual?: string;
  error?: string;
  level: QGStatus;
  metric: MetricKey;
  op: string;
  period?: number;
  warning?: string;
}

export interface QualityGateStatusConditionEnhanced extends QualityGateStatusCondition {
  measure: MeasureEnhanced;
}

export interface SearchPermissionsParameters {
  gateName: string;
  q?: string;
  selected?: 'all' | 'selected' | 'deselected';
}

export interface AddDeleteUserPermissionsParameters {
  gateName: string;
  login: string;
}

export interface AddDeleteGroupPermissionsParameters {
  gateName: string;
  groupName: string;
}

export interface Group {
  name: string;
}

export function isUser(item: UserBase | Group): item is UserBase {
  return item && (item as UserBase).login !== undefined;
}

export enum QGBadgeType {
  'Missing' = 'missing',
  'Weak' = 'weak',
  'Ok' = 'ok',
}

export enum BadgeTarget {
  QualityGate = 'quality_gate',
  Condition = 'condition',
}

export interface QualityGateProject {
  containsAiCode?: boolean;
  key: string;
  name: string;
  selected: boolean;
}
