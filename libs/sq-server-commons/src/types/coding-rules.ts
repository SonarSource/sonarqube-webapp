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
  CodeAttributeCategory,
  SoftwareImpactSeverity,
  SoftwareQuality,
} from '~shared/types/clean-code-taxonomy';
import { Paging } from '~shared/types/paging';
import { Rule, RuleActivationAdvanced, RuleInheritance } from '~shared/types/rules';

export interface RuleRepository {
  key: string;
  language: string;
  name: string;
}

export interface GetRulesAppResponse {
  canWrite?: boolean;
  repositories: RuleRepository[];
}

export interface SearchRulesResponse {
  actives?: Record<string, RuleActivationAdvanced[]>;
  facets?: { property: string; values: { count: number; val: string }[] }[];
  paging: Paging;
  rules: Rule[];
}

export interface CodingRulesQuery {
  activation: boolean | undefined;
  active_impactSeverities: SoftwareImpactSeverity[];
  active_severities: string[];
  availableSince: Date | undefined;
  cleanCodeAttributeCategories: CodeAttributeCategory[];
  compareToProfile: string | undefined;
  cwe: string[];
  impactSeverities: SoftwareImpactSeverity[];
  impactSoftwareQualities: SoftwareQuality[];
  inheritance: RuleInheritance | undefined;
  languages: string[];
  'owaspMobileTop10-2024': string[];
  'owaspMobileTop10-2024Open': boolean | undefined;
  'owaspMobileTop10-2024Stats': boolean | undefined;
  owaspTop10: string[];
  'owaspTop10-2021': string[];
  prioritizedRule: boolean | undefined;
  profile: string | undefined;
  repositories: string[];
  ruleKey: string | undefined;
  searchQuery: string | undefined;
  severities: string[];
  sonarsourceSecurity: string[];
  statuses: string[];
  tags: string[];
  template: boolean | undefined;
  types: string[];
}
