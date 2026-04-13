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
import { post } from '~sq-server-commons/helpers/request';

export type Period = 'month' | 'quarter' | 'year' | 'all';

export interface DimensionSavings {
  dollars: number;
  hours: number;
  netNewDebt: boolean;
}

export interface TimeSavings {
  maintainability: DimensionSavings;
  reliability: DimensionSavings;
  security: DimensionSavings;
  total: DimensionSavings;
}

export interface ProfileSummary {
  hourlyRate: number;
  industry: string;
  region: string;
}

export interface Counterfactual {
  dollarsPerMonth: number;
  issuesPerMonth: number;
}

export interface ROI {
  licenseCost: number;
  ratio: number;
  totalSavings: number;
}

export interface AICodeMetrics {
  aiGeneratedIssueCount: number;
  aiPassRate: number;
  enabled: boolean;
  humanVsAiIssueRate?: string;
}

export interface RemediationBreakdown {
  estimatedTokenCost: number;
  estimatedTokens: number;
  humanCost: number;
  humanHours: number;
  totalCost: number;
}

export type SavingsMode = 'measured' | 'estimated';

export interface CostSummary {
  aiCodeMetrics?: AICodeMetrics;
  companyProfile: ProfileSummary;
  configured: boolean;
  counterfactual: Counterfactual;
  edition?: string;
  hasMeasureHistory?: boolean;
  industryBreachBenchmark: number;
  issuesPerKLoc: number;
  openVulnerabilityCount: number;
  periodEnd: string;
  periodStart: string;
  projectCount: number;
  remediationBreakdown?: RemediationBreakdown;
  resolvedIssueCount: number;
  roi?: ROI;
  savingsMode?: SavingsMode;
  timeSavings: TimeSavings;
  vulnerabilityCategoryCount: number;
}

export interface SeverityBreakdown {
  [severity: string]: number;
}

export interface SecurityCategory {
  benchmarkSource: string;
  category: string;
  categoryKey: string;
  complianceFrameworks?: string[];
  cwe: string[];
  industryBenchmarkCost: number;
  issueCount: number;
  narrative: string;
  owasp: string;
  severityBreakdown: SeverityBreakdown;
}

export interface ScaDependencyRisks {
  count: number;
  narrative: string;
  supplyChainBenchmark: number;
}

export interface RevenueContext {
  avgRansomwareCost: number;
  maxGDPRExposure: number;
  narrative: string;
}

export interface SecurityDetail {
  categories: SecurityCategory[];
  revenueContext?: RevenueContext;
  scaDependencyRisks: ScaDependencyRisks;
  totalBySeverity: SeverityBreakdown;
}

export interface MonthlyTrend {
  dollars: number;
  hours: number;
  issuesResolved: number;
  month: string;
  vulnerabilitiesFound: number;
}

export interface TrendData {
  monthly: MonthlyTrend[];
}

export interface CompanyProfile {
  annualRevenue?: number;
  developerCount?: number;
  employeeCount?: number;
  hourlyRate?: number;
  industry: string;
  licenseCost?: number;
  region: string;
  telemetryOptIn?: boolean;
  tokenPricePerMillion?: number;
}

export interface BenchmarkData {
  avgSavingsByIndustry: Record<string, number>;
  avgVulnerabilityCategories: number;
  maturityCurve: Record<string, number>;
  totalCustomers: number;
}

export interface ProjectInfo {
  estimatedSavings: number;
  issueCount: number;
  key: string;
  lastAnalysis: string | null;
  name: string;
}

export interface ProjectListResponse {
  projects: ProjectInfo[];
}

export function getCostSummary(period: Period, projects?: string[]): Promise<CostSummary> {
  const params: Record<string, string | undefined> = { period };
  if (projects && projects.length > 0) {
    params.projects = projects.join(',');
  }
  return getJSON('/api/cost-savings/summary', params).catch(throwGlobalError);
}

export function getSecurityDetail(projects?: string[]): Promise<SecurityDetail> {
  const params: Record<string, string | undefined> = {};
  if (projects && projects.length > 0) {
    params.projects = projects.join(',');
  }
  return getJSON('/api/cost-savings/security-detail', params).catch(throwGlobalError);
}

export function getTrends(months = 12, projects?: string[]): Promise<TrendData> {
  const params: Record<string, string | number | undefined> = { months };
  if (projects && projects.length > 0) {
    params.projects = projects.join(',');
  }
  return getJSON('/api/cost-savings/trends', params).catch(throwGlobalError);
}

export function getConfiguration(): Promise<CompanyProfile> {
  return getJSON('/api/cost-savings/configuration').catch(throwGlobalError);
}

export function setConfiguration(profile: CompanyProfile): Promise<void> {
  return post('/api/cost-savings/set_configuration', profile).catch(throwGlobalError);
}

export function getProjectList(): Promise<ProjectListResponse> {
  return getJSON('/api/cost-savings/projects').catch(throwGlobalError);
}

export function getBenchmarks(): Promise<BenchmarkData> {
  return getJSON('/api/cost-savings/benchmarks').catch(throwGlobalError);
}
