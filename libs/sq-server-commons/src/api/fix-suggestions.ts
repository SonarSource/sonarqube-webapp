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

import { axiosClient, axiosToCatch } from '~shared/helpers/axios-clients';
import { postJSONBody } from '../helpers/request';
import { AiCodeFixFeatureEnablement, SuggestedFix } from '../types/fix-suggestions';

export interface FixParam {
  issueId: string;
}

export interface AiIssue {
  aiSuggestion: 'AVAILABLE' | 'NOT_AVAILABLE_FILE_LEVEL_ISSUE' | 'NOT_AVAILABLE_UNSUPPORTED_RULE';
  id: string;
}

export type SubscriptionType = 'EARLY_ACCESS' | 'PAID' | 'NOT_PAID';

export type BannerType = 'ENABLE' | 'LEARN_MORE';

export interface SubscriptionTypeResponse {
  subscriptionType?: SubscriptionType;
}

export const MASKED_SECRET = '****';

export const CUSTOM_PROVIDER_TYPE = 'CUSTOM';

export function getProviderKey(provider: { model: string | null; type: string }): string {
  return provider.model === null ? provider.type : `${provider.type}:${provider.model}`;
}

export interface CustomHeader {
  name: string;
  secret: boolean;
  value: string;
}

export interface Provider {
  config: Record<string, string>;
  headers: CustomHeader[] | null;
  model: string | null;
  name: string;
  recommended: boolean | null;
  selected: boolean;
  selfHosted: boolean;
  type: string;
}

export type AIFeatureEnablement =
  | {
      enabledProjectKeys: string[] | null;
      enablement: AiCodeFixFeatureEnablement.allProjects | AiCodeFixFeatureEnablement.someProjects;
      providers: Provider[];
    }
  | {
      enabledProjectKeys: null;
      enablement: AiCodeFixFeatureEnablement.disabled;
      providers: Provider[];
    };

export interface UpdateFeatureEnablementParams {
  enabledProjectKeys?: string[] | null;
  enablement: AiCodeFixFeatureEnablement;
  provider: {
    config: Record<string, string>;
    headers: CustomHeader[] | null;
    model?: string | null;
    type: string;
  } | null;
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

export function updateFeatureEnablement(
  featureEnablementParams: UpdateFeatureEnablementParams,
): Promise<void> {
  return axiosToCatch.patch(`/api/v2/fix-suggestions/feature-enablements`, featureEnablementParams);
}

export function getFeatureEnablement(): Promise<AIFeatureEnablement> {
  return axiosClient.get(`/api/v2/fix-suggestions/feature-enablements`);
}
