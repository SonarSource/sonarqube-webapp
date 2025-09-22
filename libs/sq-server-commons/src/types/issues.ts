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
  CodeAttribute,
  CodeAttributeCategory,
  SoftwareImpactSeverity,
  SoftwareQuality,
  SoftwareQualityImpact,
} from '~shared/types/clean-code-taxonomy';
import { Paging } from '~shared/types/paging';
import { Issue, TextRange } from './types';
import { UserBase } from './users';

export { IssueSeverity } from '~shared/types/issues';

export const ASSIGNEE_ME = '__me__';

export enum IssueType {
  CodeSmell = 'CODE_SMELL',
  Vulnerability = 'VULNERABILITY',
  Bug = 'BUG',
  SecurityHotspot = 'SECURITY_HOTSPOT',
}

export enum IssueScope {
  Main = 'MAIN',
  Test = 'TEST',
}

export enum IssueResolution {
  Unresolved = '',
  FalsePositive = 'FALSE-POSITIVE',
  Fixed = 'FIXED',
  Removed = 'REMOVED',
  WontFix = 'WONTFIX',
}

export enum IssueDeprecatedStatus {
  Open = 'OPEN',
  Confirmed = 'CONFIRMED',
  Reopened = 'REOPENED',
  Resolved = 'RESOLVED',
  Closed = 'CLOSED',
}

export enum IssueStatus {
  Open = 'OPEN',
  Fixed = 'FIXED',
  Confirmed = 'CONFIRMED',
  Accepted = 'ACCEPTED',
  FalsePositive = 'FALSE_POSITIVE',
  InSandbox = 'IN_SANDBOX',
}

export enum IssueActions {
  SetType = 'set_type',
  SetTags = 'set_tags',
  SetSeverity = 'set_severity',
  Comment = 'comment',
  Assign = 'assign',
}

// The order should be kept for issue transition
export enum IssueTransition {
  UnConfirm = 'unconfirm',
  Reopen = 'reopen',
  Accept = 'accept',
  FalsePositive = 'falsepositive',
  Confirm = 'confirm',
  Resolve = 'resolve',
  WontFix = 'wontfix',
}

interface Comment {
  createdAt: string;
  htmlText: string;
  key: string;
  login: string;
  markdown: string;
  updatable: boolean;
}

export interface MessageFormatting {
  end: number;
  start: number;
  type: MessageFormattingType;
}

export enum MessageFormattingType {
  CODE = 'CODE',
}

export interface RawFlowLocation {
  component: string;
  index?: number;
  msg?: string;
  msgFormattings?: MessageFormatting[];
  textRange: TextRange;
}

export interface RawIssue {
  actions: string[];
  assignee?: string;
  author?: string;
  cleanCodeAttribute: CodeAttribute;
  cleanCodeAttributeCategory: CodeAttributeCategory;
  codeVariants?: string[];
  comments?: Comment[];
  component: string;
  creationDate: string;
  flows?: Array<{
    description?: string;
    locations?: RawFlowLocation[];
    type?: string;
  }>;
  fromSonarQubeUpdate?: boolean;
  impacts: SoftwareQualityImpact[];
  internalTags?: string[];
  issueStatus: IssueStatus;
  key: string;
  line?: number;
  message?: string;
  messageFormattings?: MessageFormatting[];
  prioritizedRule?: boolean;
  project: string;
  quickFixAvailable?: boolean;
  resolution?: string;
  rule: string;
  ruleDescriptionContextKey?: string;
  ruleStatus?: string;
  scope: string;
  severity: string;
  status: string;
  tags?: string[];
  textRange?: TextRange;
  transitions: IssueTransition[];
  type: IssueType;
}

export interface IssueResponse {
  components?: Array<{ key: string; name: string }>;
  issue: RawIssue;
  rules?: Array<{}>;
  users?: UserBase[];
}

export interface RawIssuesResponse {
  components: ReferencedComponent[];
  effortTotal: number;
  facets: RawFacet[];
  issues: RawIssue[];
  languages: ReferencedLanguage[];
  paging: Paging;
  rules?: Array<{}>;
  users?: UserBase[];
}

export interface ListIssuesResponse {
  components: ReferencedComponent[];
  issues: RawIssue[];
  paging: Paging;
  rules?: Array<{}>;
}

export interface FetchIssuesPromise {
  components?: ReferencedComponent[];
  effortTotal?: number;
  facets?: RawFacet[];
  issues: Issue[];
  languages?: ReferencedLanguage[];
  paging: Paging;
  rules: ReferencedRule[];
  users?: UserBase[];
}

export interface ListIssuesPromise {
  issues: Issue[];
  paging: Paging;
  rules: ReferencedRule[];
}

export interface ReferencedComponent {
  enabled?: boolean;
  key: string;
  longName?: string;
  name: string;
  path?: string;
  uuid: string;
}

export interface ReferencedLanguage {
  name: string;
}

export interface ReferencedRule {
  langName?: string;
  name: string;
}

export interface RawFacet {
  property: string;
  values: Array<{ count: number; val: string }>;
}

export interface Facet {
  [value: string]: number;
}

export enum FacetName {
  AssignedToMe = 'assigned_to_me',
  Assignees = 'assignees',
  Author = 'author',
  CodeVariants = 'codeVariants',
  CreatedAt = 'createdAt',
  Cwe = 'cwe',
  Directories = 'directories',
  Files = 'files',
  Languages = 'languages',
  OwaspTop10 = 'owaspTop10',
  Projects = 'projects',
  Reporters = 'reporters',
  Resolutions = 'resolutions',
  Rules = 'rules',
  Severities = 'severities',
  Statuses = 'statuses',
  Tags = 'tags',
  Types = 'types',
}

export const OWASP_ASVS_4_0 = 'owaspAsvs-4.0';

export interface IssuesQuery {
  [OWASP_ASVS_4_0]: string[];
  assigned: boolean;
  assignees: string[];
  author: string[];
  casa: string[];
  cleanCodeAttributeCategories: CodeAttributeCategory[];
  codeVariants: string[];
  createdAfter: Date | undefined;
  createdAt: string;
  createdBefore: Date | undefined;
  createdInLast: string;
  cwe: string[];
  directories: string[];
  files: string[];
  fixedInPullRequest: string;
  fromSonarQubeUpdate?: boolean;
  impactSeverities: SoftwareImpactSeverity[];
  impactSoftwareQualities: SoftwareQuality[];
  inNewCodePeriod: boolean;
  issueStatuses: IssueStatus[];
  issues: string[];
  languages: string[];
  owaspAsvsLevel: string;
  'owaspMobileTop10-2024': string[];
  owaspTop10: string[];
  'owaspTop10-2021': string[];
  'pciDss-3.2': string[];
  'pciDss-4.0': string[];
  prioritizedRule?: boolean;
  projects: string[];
  resolved?: boolean;
  rules: string[];
  scopes: string[];
  severities: string[];
  sonarsourceSecurity: string[];
  sort: string;
  // Legacy purpose
  statuses: string[];
  'stig-ASD_V5R3': string[];
  tags: string[];
  types: string[];
}
