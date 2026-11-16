/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource Sàrl
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

import { throwGlobalError } from '~adapters/helpers/error';
import { getJSON } from '~adapters/helpers/request';
import { RequestData } from '../helpers/request';
import { SoftwareQualityImpact } from '../types/clean-code-taxonomy';
import { Paging } from '../types/paging';
import { AgentIssueIdentity, LegacyIssueIdentity, ScannerIssueIdentity } from '../types/issues';

export interface IssueBaseShared {
  component: string;
  componentKey: string;
  creationDate: string;
  externalRuleEngine?: string;
  findingCategory?: string;
  impacts: SoftwareQualityImpact[];
  key: string;
  message: string;
  tags?: string[];
  title?: string;
}

export type ScannerIssueShared = IssueBaseShared & ScannerIssueIdentity;
export type AgentIssueShared = IssueBaseShared & AgentIssueIdentity;
export type LegacyIssueShared = IssueBaseShared & LegacyIssueIdentity;

export type IssueShared = ScannerIssueShared | AgentIssueShared | LegacyIssueShared;

export interface IssueComponentBaseShared {
  key: string;
  name: string;
  path?: string;
}

export interface IssueResponseBaseShared {
  components: IssueComponentBaseShared[];
  issues: IssueShared[];
  paging: Paging;
}

export function searchIssues(query: RequestData): Promise<IssueResponseBaseShared> {
  return getJSON<IssueResponseBaseShared>('/api/issues/search', query).catch(throwGlobalError);
}
