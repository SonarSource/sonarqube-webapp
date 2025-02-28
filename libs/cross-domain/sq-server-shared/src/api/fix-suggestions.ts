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

import axios from 'axios';
import { axiosToCatch, postJSONBody } from '../helpers/request';
import { AiCodeFixFeatureEnablement, SuggestedFix } from '../types/fix-suggestions';

export interface FixParam {
  issueId: string;
}

export interface AiIssue {
  aiSuggestion: 'AVAILABLE' | 'NOT_AVAILABLE_FILE_LEVEL_ISSUE' | 'NOT_AVAILABLE_UNSUPPORTED_RULE';
  id: string;
}

export type SuggestionServiceStatus =
  | 'SUCCESS'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'CONNECTION_ERROR'
  | 'SERVICE_ERROR';

export type SubscriptionType = 'EARLY_ACCESS' | 'PAID' | 'NOT_PAID';

export type BannerType = 'ENABLE' | 'LEARN_MORE';

export interface ServiceInfo {
  isEnabled?: boolean;
  status: SuggestionServiceStatus;
  subscriptionType?: SubscriptionType;
}

export interface SubscriptionTypeResponse {
  subscriptionType?: SubscriptionType;
}

export interface AIFeatureEnablement {
  enabledProjectKeys: string[];
  enablement: AiCodeFixFeatureEnablement;
  // TODO Align with backend
  provider: LLMOption;
}

type LLMOpenAIOption = {
  key: 'OPENAI';
};

type LLMAzureOption = {
  apiKey?: string;
  endpoint: string;
  key: 'AZURE_OPENAI';
};

export type LLMOption = LLMOpenAIOption | LLMAzureOption;

export interface LLMProvider {
  providerKey: string;
  providerName: string;
  recommended: boolean;
  selfHosted: boolean;
}

export function sendTelemetryInfo(bannerType: BannerType) {
  return () => {
    postJSONBody('/api/v2/fix-suggestions/feature-enablements/awareness-banner-interactions', {
      bannerType,
    }).catch(() => {});
  };
}

export function getSuggestions(data: FixParam): Promise<SuggestedFix> {
  return axiosToCatch.post<SuggestedFix>('/api/v2/fix-suggestions/ai-suggestions', data);
}

export function getFixSuggestionsIssues(data: FixParam): Promise<AiIssue> {
  return axiosToCatch.get(`/api/v2/fix-suggestions/issues/${data.issueId}`);
}

export function getFixSuggestionServiceInfo(): Promise<ServiceInfo> {
  return axiosToCatch.get(`/api/v2/fix-suggestions/service-info`);
}

export function getFixSuggestionSubscriptionType(): Promise<SubscriptionTypeResponse> {
  return axiosToCatch.get('/api/v2/fix-suggestions/service-info/subscription-type');
}

export function updateFeatureEnablement(
  featureEnablementParams: AIFeatureEnablement,
): Promise<void> {
  return axiosToCatch.patch(`/api/v2/fix-suggestions/feature-enablements`, featureEnablementParams);
}

export function getFeatureEnablement(): Promise<AIFeatureEnablement> {
  return axios.get(`/api/v2/fix-suggestions/feature-enablements`);
}

export function getLlmProviders(): Promise<LLMProvider[]> {
  return axios.get(`/api/v2/fix-suggestions/supported-llm-providers`);
}
