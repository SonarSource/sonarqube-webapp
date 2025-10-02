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

import { AlmKeys } from '../types/alm-settings';

export const COMMUNITY_FORUM_URL = 'https://community.sonarsource.com/c/help/sq';

export const DOC_URL = 'https://docs.sonarsource.com/sonarqube/latest';

export enum DocLink {
  AccountTokens = '/user-guide/managing-tokens/',
  ActiveVersions = '/server-upgrade-and-maintenance/upgrade/upgrade-the-server/release-cycle-model/',
  AiCodeAssurance = '/ai-capabilities/overview/',
  AiCodeAssuranceProfiles = '/quality-standards-administration/ai-code-assurance/quality-profiles-for-ai-code/',
  AiCodeDetection = '/ai-capabilities/autodetect-ai-code/',
  AiCodeFixEnabling = '/instance-administration/ai-features/enable-ai-codefix/',
  AiCodeAssuranceQualifyQualityGate = '/ai-capabilities/ai-code-assurance/',
  AlmAzureIntegration = '/devops-platform-integration/azure-devops-integration/introduction/',
  AlmBitBucketCloudAuth = '/instance-administration/authentication/bitbucket-cloud/',
  AlmBitBucketCloudIntegration = '/devops-platform-integration/bitbucket-integration/bitbucket-cloud-integration/',
  AlmBitBucketCloudSettings = '/instance-administration/authentication/bitbucket-cloud/#setting-your-authentication-settings-in-sonarqube',
  AlmBitBucketServerIntegration = '/devops-platform-integration/bitbucket-integration/bitbucket-server-integration/',
  AlmGitHubAuth = '/instance-administration/authentication/github/',
  AlmGitHubIntegration = '/devops-platform-integration/github-integration/introduction/',
  AlmGitHubMonorepoWorkfileExample = '/devops-platform-integration/github-integration/adding-analysis-to-github-actions-workflow/#configuring-the-buildyml-file',
  AlmGitLabAuth = '/instance-administration/authentication/gitlab/setting-up/',
  AlmGitLabAuthJITProvisioningMethod = '/instance-administration/authentication/gitlab/provisioning-modes/just-in-time/',
  AlmGitLabAuthAutoProvisioningMethod = '/instance-administration/authentication/gitlab/provisioning-modes/automatic/',
  AlmGitLabIntegration = '/devops-platform-integration/gitlab-integration/introduction/',
  AlmSamlAuth = '/instance-administration/authentication/saml/overview/',
  AlmSamlScimAuth = '/instance-administration/authentication/saml/scim/overview/',
  AnalysisScope = '/project-administration/setting-analysis-scope/introduction/',
  AnalysisScopeWildcardPatterns = '/project-administration/setting-analysis-scope/defining-matching-patterns/',
  AuthOverview = '/instance-administration/authentication/overview/',
  BackgroundTasks = '/analyzing-source-code/background-tasks/',
  BackgroundTasksReIndexingSingleProject = '/server-upgrade-and-maintenance/maintenance/reindexing/#reindexing-single-project',
  BranchAnalysis = '/analyzing-source-code/branch-analysis/introduction/',
  CFamilyBuildWrapper = '/analyzing-source-code/languages/c-family/prerequisites/#using-buildwrapper',
  CFamilyCompilationDatabase = '/analyzing-source-code/languages/c-family/prerequisites/#using-thirdparty-tools',
  CIAnalysisSetup = '/analyzing-source-code/ci-integration/overview/',
  CIJenkins = '/analyzing-source-code/ci-integration/jenkins-integration/key-features/',
  CleanCode = '/user-guide/rules/software-qualities/',
  CleanCodeDefinition = '/glossary/',
  DatabaseRequirements = '/server-installation/installing-the-database/#database-requirements',
  DeprecatedFeatures = '/server-upgrade-and-maintenance/release-notes/#deprecations-and-removals',
  InactiveBranches = '/project-administration/maintaining-the-branches-of-your-project/#manage-inactive-branches',
  InstanceAdminEncryption = '/instance-administration/encrypting-settings/',
  InstanceAdminLicense = '/instance-administration/license-administration/',
  InstanceAdminLoC = '/server-upgrade-and-maintenance/monitoring/lines-of-code/',
  InstanceAdminMarketplace = '/server-upgrade-and-maintenance/upgrade/marketplace/',
  InstanceAdminPluginVersionMatrix = '/server-installation/plugins/plugin-version-matrix/',
  InstanceAdminQualityProfiles = '/quality-standards-administration/managing-quality-profiles/introduction/',
  InstanceAdminQualityProfilesPrioritizingRules = '/quality-standards-administration/managing-quality-profiles/editing-a-custom-quality-profile/#marking-a-rule-as-prioritized',
  InstanceAdminReindexation = '/server-upgrade-and-maintenance/maintenance/reindexing/',
  InstanceAdminSecurity = '/instance-administration/system-functions/security/',
  IssueResolutions = '/user-guide/issues/solution-overview/#deprecated-features',
  Issues = '/user-guide/issues/introduction/',
  IssuesFromSonarQubeUpdate = '/user-guide/issues/solution-overview/#from-sonarqube-update',
  IssueStatuses = '/user-guide/issues/solution-overview/#life-cycle',
  MainBranchAnalysis = '/project-administration/maintaining-the-branches-of-your-project/',
  MaintainBranches = '/project-administration/maintaining-the-branches-of-your-project/#keep-specific-branches-from-deletion',
  ManagingPortfolios = '/project-administration/managing-portfolios/',
  MetricDefinitions = '/user-guide/code-metrics/metrics-definition/',
  ModeOverview = '/instance-administration/analysis-functions/instance-mode/instance-mode-overview',
  ModeMQR = '/instance-administration/analysis-functions/instance-mode/mqr-mode',
  ModeStandard = '/instance-administration/analysis-functions/instance-mode/standard-experience',
  Monorepos = '/project-administration/monorepos/',
  NewCodeDefinition = '/user-guide/about-new-code/',
  NewCodeDefinitionOptions = '/user-guide/about-new-code#new-code-definitions',
  NewCodeRecommended = '/user-guide/about-new-code#recommended-option-depending-on-project-type',
  PortfolioBreakdown = '/user-guide/viewing-reports/portfolios/#portfolio-breakdown',
  Portfolios = '/user-guide/viewing-reports/portfolios/',
  ProjectRegulatoryReports = '/user-guide/viewing-reports/regulatory-reports/',
  PullRequestAnalysis = '/analyzing-source-code/pull-request-analysis/introduction/',
  QualityGates = '/quality-standards-administration/managing-quality-gates/introduction-to-quality-gates/',
  QualityGatesRecommendedConditions = '/quality-standards-administration/managing-quality-gates/introduction-to-quality-gates#quality-gate-and-new-code',
  Root = '/',
  RuleSeverity = '/quality-standards-administration/managing-quality-profiles/#rule-severity',
  MQRSeverity = '/instance-administration/analysis-functions/instance-mode/mqr-mode/#mqr-severity',
  RulesOverview = '/user-guide/rules/overview',
  SecurityHotspots = '/user-guide/security-hotspots/',
  SecurityReports = '/user-guide/viewing-reports/security-reports/',
  ServerUpgradeRoadmap = '/server-upgrade-and-maintenance/upgrade/roadmap/',
  SonarLintConnectedMode = '/user-guide/connected-mode/',
  SonarScanner = '/analyzing-source-code/scanners/sonarscanner/',
  SonarScannerRequirements = '/analyzing-source-code/scanners/scanner-environment/general-requirements/',
  SonarScannerDotNet = '/analyzing-source-code/scanners/dotnet/introduction/',
  SonarScannerGradle = '/analyzing-source-code/scanners/sonarscanner-for-gradle/',
  SonarScannerMaven = '/analyzing-source-code/scanners/sonarscanner-for-maven/',
  SonarScannerNpm = '/analyzing-source-code/scanners/npm/introduction',
  SonarScannerPython = '/advanced-setup/ci-based-analysis/sonarscanner-for-python/',
  SonarWayQualityGate = '/quality-standards-administration/managing-quality-gates/introduction-to-quality-gates/#sonar-way-recommended-quality-gate',
  Webhooks = '/project-administration/webhooks/',
}

export enum SonarSourceLink {
  AiCodeFixTerms = '/legal/ai-codefix-terms/',
  TermsAndConditions = '/legal/sonarqube/terms-and-conditions/',
  AdvancedSecurity = '/products/sonarqube/advanced-security/',
  PlansAndPricing = '/plans-and-pricing/sonarqube/',
  Downloads = '/products/sonarqube/downloads/',
}

export const DocTitle = {
  [DocLink.BackgroundTasks]: 'About Background Tasks',
  [DocLink.CIAnalysisSetup]: 'Set up CI analysis',
  [DocLink.InstanceAdminQualityProfiles]: 'About Quality Profiles',
  [DocLink.MetricDefinitions]: 'Metric Definitions',
  [DocLink.NewCodeDefinition]: 'Defining New Code',
  [DocLink.PullRequestAnalysis]: 'Analyzing Pull Requests',
  [DocLink.SecurityReports]: 'About Security Reports',
  [DocLink.SonarLintConnectedMode]: 'SonarLint Connected Mode',
  [DocLink.Webhooks]: 'About Webhooks',
};

export type DocTitleKey = keyof typeof DocTitle;

const asDocSections = <T>(element: { [K in keyof T]: DocTitleKey[] }) => element;

export const DocSection = asDocSections({
  component_measures: [DocLink.MetricDefinitions],
  overview: [DocLink.PullRequestAnalysis, DocLink.CIAnalysisSetup, DocLink.SonarLintConnectedMode],
  pull_requests: [DocLink.PullRequestAnalysis, DocLink.SonarLintConnectedMode],
});

export type DocSectionKey = keyof typeof DocSection;

export const AlmAuthDocLinkKeys = {
  [AlmKeys.BitbucketServer]: DocLink.AlmBitBucketCloudAuth,
  [AlmKeys.GitHub]: DocLink.AlmGitHubAuth,
  [AlmKeys.GitLab]: DocLink.AlmGitLabAuth,
  saml: DocLink.AlmSamlAuth,
};
