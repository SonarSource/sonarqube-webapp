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

import {
  CleanCodeAttribute,
  CleanCodeAttributeCategory,
  SoftwareImpactSeverity,
  SoftwareQuality,
  SoftwareQualityImpact,
} from './clean-code-taxonomy';

export interface Rule {
  cleanCodeAttribute?: CleanCodeAttribute;
  cleanCodeAttributeCategory?: CleanCodeAttributeCategory;
  impacts?: SoftwareQualityImpact[];
  isTemplate?: boolean;
  key: string;
  lang?: string;
  langName?: string;
  name: string;
  params?: RuleParameter[];
  severity: string;
  status: string;
  sysTags?: string[];
  tags?: string[];
  type: RuleType;
}

export interface RuleDetails extends Rule {
  createdAt: string;
  debtRemFnType?: string;
  defaultDebtRemFnType?: string;
  defaultRemFnBaseEffort?: string;
  defaultRemFnType?: string;
  descriptionSections?: RuleDescriptionSection[];
  educationPrinciples?: string[];
  gapDescription?: string;
  htmlDesc?: string;
  htmlNote?: string;
  internalKey?: string;
  isExternal?: boolean;
  mdDesc?: string;
  mdNote?: string;
  remFnBaseEffort?: string;
  remFnGapMultiplier?: string;
  remFnOverloaded?: boolean;
  remFnType?: string;
  repo: string;
  scope?: RuleScope;
  templateKey?: string;
}

export interface RuleActivation {
  createdAt: string;
  inherit: RuleInheritance;
  params: { key: string; value: string }[];
  qProfile: string;
  severity: string;
}

export interface RuleActivationAdvanced extends RuleActivation {
  impacts: {
    severity: SoftwareImpactSeverity;
    softwareQuality: SoftwareQuality;
  }[];
  prioritizedRule: boolean;
}

export enum RuleDescriptionSections {
  Default = 'default',
  Introduction = 'introduction',
  RootCause = 'root_cause',
  AssessTheProblem = 'assess_the_problem',
  HowToFix = 'how_to_fix',
  Resources = 'resources',
}

export interface RuleDescriptionContext {
  displayName: string;
  key: string;
}

export interface RuleDescriptionSection {
  content: string;
  context?: RuleDescriptionContext;
  key: RuleDescriptionSections;
}

export interface RuleParameter {
  defaultValue?: string;
  htmlDesc?: string;
  key: string;
  type: string;
}

export type RuleInheritance = 'NONE' | 'INHERITED' | 'OVERRIDES';

export type RuleScope = 'MAIN' | 'TEST' | 'ALL';

export enum RuleStatus {
  Ready = 'READY',
  Beta = 'BETA',
  Deprecated = 'DEPRECATED',
  Removed = 'REMOVED',
}

export const RuleTypes = [
  'BUG',
  'VULNERABILITY',
  'CODE_SMELL',
  'SECURITY_HOTSPOT',
  'VIOLATION', // Only in SQ-Cloud, might not be needed anymore
  'UNKNOWN',
] as const;

export type RuleType = (typeof RuleTypes)[number];
