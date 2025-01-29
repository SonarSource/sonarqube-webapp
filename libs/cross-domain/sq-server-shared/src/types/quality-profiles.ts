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

import { LabelValueSelectOption } from '../design-system';
import {
  CleanCodeAttribute,
  CleanCodeAttributeCategory,
  SoftwareImpactSeverity,
  SoftwareQuality,
} from './clean-code-taxonomy';
import { IssueSeverity } from './issues';
import { Dict } from './types';

export enum QualityProfileChangelogFilterMode {
  MQR = 'MQR',
  STANDARD = 'STANDARD',
}

export interface ProfileActions {
  associateProjects?: boolean;
  copy?: boolean;
  delete?: boolean;
  edit?: boolean;
  setAsDefault?: boolean;
}

export interface BaseProfile {
  actions?: ProfileActions;
  activeDeprecatedRuleCount: number;
  activeRuleCount: number;
  isBuiltIn?: boolean;
  isDefault?: boolean;
  isInherited?: boolean;
  key: string;
  language: string;
  languageName: string;
  lastUsed?: string;
  name: string;
  parentKey?: string;
  parentName?: string;
  projectCount?: number;
  rulesUpdatedAt?: string;
  userUpdatedAt?: string;
}

export interface Profile extends BaseProfile {
  childrenCount: number;
  depth: number;
}

export interface Exporter {
  key: string;
  languages: string[];
  name: string;
}

export interface ProfileChangelogEventImpactChange {
  newSeverity?: SoftwareImpactSeverity;
  newSoftwareQuality?: SoftwareQuality;
  oldSeverity?: SoftwareImpactSeverity;
  oldSoftwareQuality?: SoftwareQuality;
}

export enum ChangelogEventAction {
  Activated = 'ACTIVATED',
  Deactivated = 'DEACTIVATED',
  Updated = 'UPDATED',
}

export interface ProfileChangelogEvent {
  action: ChangelogEventAction;
  authorName?: string;
  cleanCodeAttributeCategory?: CleanCodeAttributeCategory;
  date: string;
  // impacts should be always set in the wild. But Next currently has a specific database state for which this field is undefined. May be possible to make this field required in the future.
  impacts?: {
    severity: SoftwareImpactSeverity;
    softwareQuality: SoftwareQuality;
  }[];
  params?: {
    impactChanges?: ProfileChangelogEventImpactChange[];
    newCleanCodeAttribute?: CleanCodeAttribute;
    newCleanCodeAttributeCategory?: CleanCodeAttributeCategory;
    oldCleanCodeAttribute?: CleanCodeAttribute;
    oldCleanCodeAttributeCategory?: CleanCodeAttributeCategory;
    prioritizedRule?: string;
    severity?: IssueSeverity;
  } & Dict<string | ProfileChangelogEventImpactChange[] | null>;
  ruleKey: string;
  ruleName: string;
  sonarQubeVersion: string;
}

export enum ProfileActionModals {
  Copy = 'COPY',
  Extend = 'EXTEND',
  Rename = 'RENAME',
  Delete = 'DELETE',
}

export interface ProfileOption extends LabelValueSelectOption {
  isDisabled: boolean;
  language: string;
}
