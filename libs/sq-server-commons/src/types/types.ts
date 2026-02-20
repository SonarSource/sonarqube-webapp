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

import {
  CodeAttribute,
  CodeAttributeCategory,
  SoftwareQualityImpact,
} from '~shared/types/clean-code-taxonomy';
import { Extension } from '~shared/types/common';
import { ComponentBase, ComponentConfiguration, ComponentQualifier } from '~shared/types/component';
import { IssueChangelogDiff } from '~shared/types/issue';
import { Measure, MeasureEnhanced } from '~shared/types/measures';
import { RuleDescriptionSection, RuleScope, RuleType } from '~shared/types/rules';
import type { SourceLine } from '~shared/types/source';
import { DocTitleKey } from '../helpers/doc-links';
import { MessageFormatting, RawIssue } from './issues';
import { NewCodeDefinitionType } from './new-code-definition';
import { UserActive, UserBase } from './users';

export type { SourceLine, SourceLineCoverageStatus } from '~shared/types/source';

export interface ApiError {
  message: string;
}

export interface AIError extends ApiError {
  relatedField?: string;
}

export interface AlmApplication extends IdentityProvider {
  installationUrl: string;
}

export interface AlmRepository {
  installationKey: string;
  label: string;
  linkedProjectKey?: string;
  linkedProjectName?: string;
  private?: boolean;
}

export interface AlmUnboundApplication {
  installationId: string;
  key: string;
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Chart {
  export interface Point {
    x: Date;
    y: number | string | undefined;
  }

  export interface Serie {
    data: Point[];
    name: string;
    translatedName: string;
    type: string;
  }
}

export interface Component extends ComponentBase {
  branch?: string;
  canBrowseAllChildProjects?: boolean;
  configuration?: ComponentConfiguration;
  extensions?: Extension[];
  isAiCodeFixEnabled?: boolean;
  needIssueSync?: boolean;
}

export interface NavigationComponent
  extends Omit<Component, 'alm' | 'qualifier' | 'leakPeriodDate' | 'path' | 'tags'> {}

export interface ComponentMeasureIntern {
  analysisDate?: string;
  branch?: string;
  canBrowseAllChildProjects?: boolean;
  description?: string;
  isFavorite?: boolean;
  isRecentlyBrowsed?: boolean;
  key: string;
  match?: string;
  name: string;
  path?: string;
  project?: string;
  qualifier: string;
  refKey?: string;
}

export interface ComponentMeasure extends ComponentMeasureIntern {
  measures?: Measure[];
}

export interface ComponentMeasureEnhanced extends ComponentMeasureIntern {
  leak?: string;
  measures: MeasureEnhanced[];
  value?: string;
}

export interface Condition {
  error: string;
  id: string;
  isCaycCondition?: boolean;
  metric: string;
  op?: string;
}

export interface CustomMeasure {
  createdAt?: string;
  description?: string;
  id: string;
  metric: {
    domain?: string;
    key: string;
    name: string;
    type: string;
  };
  pending?: boolean;
  projectKey: string;
  updatedAt?: string;
  user: UserBase;
  value: string;
}

export interface Duplication {
  blocks: DuplicationBlock[];
}

export interface DuplicationBlock {
  _ref?: string;
  from: number;
  size: number;
}

export interface DuplicatedFile {
  key: string;
  name: string;
  project: string;
  projectName: string;
}

export type ExpandDirection = 'up' | 'down';

export interface FacetValue<T = string> {
  count: number;
  val: T;
}

export enum FlowType {
  DATA = 'DATA',
  EXECUTION = 'EXECUTION',
}

export interface Flow {
  description?: string;
  locations: FlowLocation[];
  type: FlowType;
}

export interface FlowLocation {
  component: string;
  componentName?: string;
  index?: number;
  msg?: string;
  msgFormattings?: MessageFormatting[];
  textRange: TextRange;
}

export interface Group {
  default?: boolean;
  description?: string;
  id: string;
  managed: boolean;
  name: string;
}

export interface GroupMembership {
  groupId: string;
  id: string;
  userId: string;
}

export enum HealthTypes {
  RED = 'RED',
  YELLOW = 'YELLOW',
  GREEN = 'GREEN',
}

export interface IdentityProvider {
  backgroundColor: string;
  helpMessage?: string;
  iconPath: string;
  key: string;
  manage?: boolean;
  name: string;
}

export interface Issue extends Omit<RawIssue, 'flows' | 'comments'> {
  assigneeActive?: boolean;
  assigneeAvatar?: string;
  assigneeLogin?: string;
  assigneeName?: string;
  branch?: string;
  comments?: IssueComment[];
  componentEnabled?: boolean;
  componentLongName: string;
  componentName: string;
  componentQualifier: string;
  componentUuid: string;
  effort?: string;
  externalRuleEngine?: string;
  flows: FlowLocation[][];
  flowsWithType: Flow[];
  fromExternalRule?: boolean;
  message: string;
  projectKey: string;
  projectName: string;
  pullRequest?: string;
  ruleName: string;
  secondaryLocations: FlowLocation[];
}

export interface IssueChangelog {
  avatar?: string;
  creationDate: string;
  diffs: IssueChangelogDiff[];
  externalUser?: string;
  isUserActive: boolean;
  user: string;
  userName: string;
  webhookSource?: string;
}

export interface IssueComment {
  author?: string;
  authorActive?: boolean;
  authorAvatar?: string;
  authorLogin?: string;
  authorName?: string;
  createdAt: string;
  htmlText: string;
  key: string;
  markdown: string;
  updatable: boolean;
}

export interface IssuesByLine {
  [key: number]: Issue[];
}

export type IssueType = 'BUG' | 'VULNERABILITY' | 'CODE_SMELL' | 'SECURITY_HOTSPOT';

export interface LinearIssueLocation {
  from: number;
  index?: number;
  line: number;
  startLine?: number;
  text?: string;
  textFormatting?: MessageFormatting[];
  to: number;
}

export interface LineMap {
  [line: number]: SourceLine;
}

export interface LinePopup {
  index?: number;
  line: number;
  name: string;
  open?: boolean;
}

export interface MyProject {
  description?: string;
  key: string;
  lastAnalysisDate?: string;
  links: Array<{
    href: string;
    name: string;
    type: string;
  }>;
  name: string;
  qualityGate?: string;
}

export interface Period {
  date: string;
  index?: number;
  mode: PeriodMode | NewCodeDefinitionType;
  modeParam?: string;
  parameter?: string;
}

/*
 * These are old baseline setting types, necessary for
 * backward compatibility.
 */
export type PeriodMode =
  | 'days'
  | 'date'
  | 'version'
  | 'previous_analysis'
  | 'previous_version'
  | 'manual_baseline';

export interface Permission {
  description: string;
  key: string;
  name: string;
}

export interface PermissionDefinition {
  description: string;
  key: string;
  name: string;
}

export type PermissionDefinitions = Array<PermissionDefinition | PermissionDefinitionGroup>;

export interface PermissionDefinitionGroup {
  category: string;
  permissions: PermissionDefinition[];
}

export interface PermissionGroup {
  description?: string;
  managed?: boolean;
  name: string;
  permissions: string[];
}

export interface PermissionUser extends UserActive {
  managed?: boolean;
  permissions: string[];
}

export interface PermissionTemplateGroup {
  groupsCount: number;
  key: string;
  usersCount: number;
  withProjectCreator?: boolean;
}

export interface PermissionTemplate {
  createdAt: string;
  defaultFor: string[];
  description?: string;
  id: string;
  name: string;
  permissions: Array<PermissionTemplateGroup>;
  projectKeyPattern?: string;
  updatedAt?: string;
}

export interface ProfileInheritanceDetails {
  activeRuleCount: number;
  inactiveRuleCount: number;
  isBuiltIn: boolean;
  key: string;
  name: string;
  overridingRuleCount?: number;
}

export interface ProjectLink {
  id: string;
  name?: string;
  type: string;
  url: string;
}

export enum CaycStatus {
  Compliant = 'compliant',
  NonCompliant = 'non-compliant',
  OverCompliant = 'over-compliant',
}

export interface QualityGatePreview {
  isDefault?: boolean;
  name: string;
}

export interface QualityGate extends QualityGatePreview {
  actions?: {
    associateProjects?: boolean;
    copy?: boolean;
    delegate?: boolean;
    delete?: boolean;
    manageAiCodeAssurance?: boolean;
    manageConditions?: boolean;
    rename?: boolean;
    setAsDefault?: boolean;
  };
  caycStatus?: CaycStatus;
  conditions?: Condition[];
  hasMQRConditions?: boolean;
  hasStandardConditions?: boolean;
  isAiCodeSupported?: boolean;
  isBuiltIn?: boolean;
}

export interface RestRule {
  cleanCodeAttribute?: CodeAttribute;
  cleanCodeAttributeCategory?: CodeAttributeCategory;
  impacts?: SoftwareQualityImpact[];
  key: string;
  language?: string;
  languageName?: string;
  name: string;
  parameters?: RestRuleParameter[];
  severity: string;
  status: string;
  systemTags?: string[];
  tags?: string[];
  template?: boolean;
  type: RuleType;
}

export interface RulesUpdateRequest {
  cleanCodeAttribute?: CodeAttribute;
  impacts?: SoftwareQualityImpact[];
  key: string;
  markdownDescription?: string;
  markdown_note?: string;
  name?: string;
  params?: string;
  remediation_fn_base_effort?: string;
  remediation_fn_type?: string;
  remediation_fy_gap_multiplier?: string;
  severity?: string;
  status?: string;
  tags?: string;
  type?: RuleType;
}

export interface RestRuleDetails extends RestRule {
  createdAt: string;
  descriptionSections?: RuleDescriptionSection[];
  educationPrinciples?: string[];
  external?: boolean;
  gapDescription?: string;
  htmlDesc?: string;
  htmlNote?: string;
  internalKey?: string;
  markdownDescription?: string;
  markdownNote?: string;
  remFnBaseEffort?: string;
  remFnGapMultiplier?: string;
  remFnType?: string;
  repositoryKey: string;
  scope?: RuleScope;
  templateKey?: string;
}

export interface RestRuleParameter {
  defaultValue?: string;
  htmlDescription?: string;
  key: string;
  type: string;
}

export enum CustomRuleType {
  ISSUE = 'ISSUE',
  SECURITY_HOTSPOT = 'SECURITY_HOTSPOT',
}

export interface Snippet {
  end: number;
  index: number;
  start: number;
  toDelete?: boolean;
}

export interface SnippetGroup extends SnippetsByComponent {
  locations: FlowLocation[];
}

export interface SnippetsByComponent {
  component: SourceViewerFile;
  sources: { [line: number]: SourceLine };
}

export interface SourceViewerFile {
  canMarkAsFavorite?: boolean;
  fav?: boolean;
  key: string;
  leakPeriodDate?: string;
  longName?: string;
  measures: {
    coverage?: string;
    duplicationDensity?: string;
    issues?: string;
    lines?: string;
    tests?: string;
  };
  name?: string;
  path: string;
  project: string;
  projectName: string;
  q: ComponentQualifier;
  uuid: string;
}

export type StandardSecurityCategories = Record<
  string,
  {
    description?: string;
    title: string;
  }
>;

export interface SubscriptionPlan {
  maxNcloc: number;
  price: number;
}

export interface SuggestionLink {
  link: DocTitleKey;
  text: string;
}

export interface SysInfoAppNode extends SysInfoBase {
  'Compute Engine Logging': SysInfoLogging;
  Name: string;
  'Web Logging': SysInfoLogging;
}

export interface SysInfoBase extends SysInfoValueObject {
  Health: HealthTypes;
  'Health Causes': string[];
  Plugins?: Record<string, string>;
  System: {
    Version: string;
  };
}

export enum Provider {
  Github = 'github',
  Gitlab = 'gitlab',
  Scim = 'SCIM',
}

export interface SysInfoCluster extends SysInfoBase {
  'Application Nodes': SysInfoAppNode[];
  'Search Nodes': SysInfoSearchNode[];
  Settings: Record<string, string>;
  Statistics?: {
    ncloc: number;
  };
  System: {
    'External Users and Groups Provisioning'?: Provider;
    'High Availability': true;
    'Lines of Code': number;
    'Server ID': string;
    Version: string;
  };
}

export interface SysInfoLogging extends Record<string, string> {
  'Logs Level': string;
}

export interface SysInfoSearchNode extends SysInfoValueObject {
  Name: string;
}

export interface SysInfoSection extends Record<string, SysInfoValueObject> {}

export interface SysInfoStandalone extends SysInfoBase {
  'Compute Engine Logging': SysInfoLogging;
  Settings: Record<string, string>;
  Statistics?: {
    ncloc: number;
  } & Record<string, string | number>;
  System: {
    'High Availability': false;
    'Server ID': string;
    Version: string;
  };
  'Web Logging': SysInfoLogging;
}

export type SysInfoValue =
  | boolean
  | string
  | number
  | undefined
  | HealthTypes
  | SysInfoValueObject
  | SysInfoValueArray;

export interface SysInfoValueArray extends Array<SysInfoValue> {}

export interface SysInfoValueObject extends Record<string, SysInfoValue> {}

export type SysStatus =
  | 'STARTING'
  | 'UP'
  | 'DOWN'
  | 'RESTARTING'
  | 'DB_MIGRATION_NEEDED'
  | 'DB_MIGRATION_RUNNING';

export interface TestCase {
  coveredLines: number;
  durationInMs: number;
  fileId: string;
  fileKey: string;
  fileName: string;
  id: string;
  message?: string;
  name: string;
  stacktrace?: string;
  status: string;
}

export interface TextRange {
  endLine: number;
  endOffset: number;
  startLine: number;
  startOffset: number;
}

export interface UserSelected extends UserActive {
  selected: boolean;
}

export interface UserGroupMember {
  login: string;
  managed: boolean;
  name: string;
  selected: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace WebApi {
  export interface Action {
    changelog: Changelog[];
    deprecatedSince?: string;
    description: string;
    hasResponseExample: boolean;
    internal: boolean;
    key: string;
    params?: Param[];
    post: boolean;
    since?: string;
  }

  export interface Changelog {
    description: string;
    version: string;
  }

  export interface Domain {
    actions: Action[];
    deprecatedSince?: string;
    description: string;
    internal?: boolean;
    path: string;
    since?: string;
  }

  export interface Example {
    example: string;
    format: string;
  }

  export interface Param {
    defaultValue?: string;
    deprecatedKey?: string;
    deprecatedKeySince?: string;
    deprecatedSince?: string;
    description: string;
    exampleValue?: string;
    internal: boolean;
    key: string;
    maxValuesAllowed?: number;
    maximumLength?: number;
    maximumValue?: number;
    minimumLength?: number;
    minimumValue?: number;
    possibleValues?: string[];
    required: boolean;
    since?: string;
  }
}
