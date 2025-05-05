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

import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { some } from 'lodash';
import React, { useContext } from 'react';
import { useIntl } from 'react-intl';
import {
  AIFeatureEnablement,
  getFeatureEnablement,
  getFixSuggestionServiceInfo,
  getFixSuggestionsIssues,
  getFixSuggestionSubscriptionType,
  getLlmProviders,
  getSuggestions,
  ServiceInfo,
  SubscriptionTypeResponse,
  updateFeatureEnablement,
} from '../api/fix-suggestions';
import { useAvailableFeatures } from '../context/available-features/withAvailableFeatures';
import { CurrentUserContext } from '../context/current-user/CurrentUserContext';
import { addGlobalErrorMessage, addGlobalSuccessMessage } from '../design-system';
import { Feature } from '../types/features';
import { AiCodeFixFeatureEnablement } from '../types/fix-suggestions';
import { AIError, Issue } from '../types/types';
import { isLoggedIn } from '../types/users';
import { createQueryHook } from './common';
import { useComponentDataQuery } from './component';
import { useRawSourceQuery } from './sources';

const UNKNOWN = -1;

export enum LineTypeEnum {
  CODE = 'code',
  ADDED = 'added',
  REMOVED = 'removed',
}

export type DisplayedLine = {
  code: string;
  copy?: string;
  lineAfter: number;
  lineBefore: number;
  type: LineTypeEnum;
};

export type CodeSuggestion = {
  changes: Array<{ endLine: number; newCode: string; startLine: number }>;
  explanation: string;
  suggestionId: string;
  unifiedLines: DisplayedLine[];
};

export function usePrefetchSuggestion(issueKey: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.prefetchQuery({ queryKey: ['fix-suggestions', issueKey] });
  };
}

export function useUnifiedSuggestionsQuery(issue: Issue, enabled = true) {
  const branchLikeParam = issue.pullRequest
    ? { pullRequest: issue.pullRequest }
    : issue.branch
      ? { branch: issue.branch }
      : {};

  const { data: code } = useRawSourceQuery(
    { ...branchLikeParam, key: issue.component },
    { enabled },
  );

  return useQuery({
    queryKey: ['fix-suggestions', issue.key],
    queryFn: ({ queryKey: [_1, issueId] }) => getSuggestions({ issueId }),
    enabled: enabled && code !== undefined,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    retry: false,
    select: (suggestedCode) => {
      if (code !== undefined && suggestedCode.changes) {
        const originalCodes = code.split(/\r?\n|\r|\n/g).map((line, index) => {
          const lineNumber = index + 1;
          const isRemoved = some(
            suggestedCode.changes,
            ({ startLine, endLine }) => startLine <= lineNumber && lineNumber <= endLine,
          );
          return {
            code: line,
            lineNumber,
            type: isRemoved ? LineTypeEnum.REMOVED : LineTypeEnum.CODE,
          };
        });

        const unifiedLines = originalCodes.flatMap<DisplayedLine>((line) => {
          const change = suggestedCode.changes.find(
            ({ endLine }) => endLine === line.lineNumber - 1,
          );
          if (change) {
            return [
              ...change.newCode.split(/\r?\n|\r|\n/g).map((newLine, index) => ({
                code: newLine,
                type: LineTypeEnum.ADDED,
                lineBefore: UNKNOWN,
                lineAfter: UNKNOWN,
                copy: index === 0 ? change.newCode : undefined,
              })),
              {
                code: line.code,
                type: line.type,
                lineBefore: line.lineNumber,
                lineAfter: UNKNOWN,
              },
            ];
          }

          return [
            {
              code: line.code,
              type: line.type,
              lineBefore: line.lineNumber,
              lineAfter: UNKNOWN,
            },
          ];
        });
        let lineAfterCount = 1;
        unifiedLines.forEach((line) => {
          if (line.type !== LineTypeEnum.REMOVED) {
            line.lineAfter = lineAfterCount;
            lineAfterCount += 1;
          }
        });
        return {
          unifiedLines,
          explanation: suggestedCode.explanation,
          changes: suggestedCode.changes,
          suggestionId: suggestedCode.id,
        };
      }
      return {
        unifiedLines: [],
        explanation: suggestedCode.explanation,
        changes: [],
        suggestionId: suggestedCode.id,
      };
    },
  });
}

export function useGetFixSuggestionsIssuesQuery(issue: Issue) {
  const { currentUser } = useContext(CurrentUserContext);
  const { hasFeature } = useAvailableFeatures();

  const isCodeFixEnabled =
    useComponentDataQuery({ component: issue.project }).data?.component?.isAiCodeFixEnabled ||
    false;

  return useQuery({
    queryKey: ['fix-suggestions', 'issues', 'details', issue.key],
    queryFn: () =>
      getFixSuggestionsIssues({
        issueId: issue.key,
      }),
    enabled: hasFeature(Feature.FixSuggestions) && isLoggedIn(currentUser) && isCodeFixEnabled,
    staleTime: Infinity,
  });
}

export function withUseGetFixSuggestionsIssues<P extends { issue: Issue }>(
  Component: React.ComponentType<
    Omit<P, 'aiSuggestionAvailable'> & { aiSuggestionAvailable: boolean }
  >,
) {
  return function WithGetFixSuggestion(props: Omit<P, 'aiSuggestionAvailable'>) {
    const { data } = useGetFixSuggestionsIssuesQuery(props.issue);
    return <Component aiSuggestionAvailable={data?.aiSuggestion === 'AVAILABLE'} {...props} />;
  };
}

export const useGetServiceInfoQuery = createQueryHook(() => {
  return queryOptions<ServiceInfo, AxiosError>({
    queryKey: ['fix-suggestions', 'service-info'],
    queryFn: getFixSuggestionServiceInfo,
  });
});

export function useGetSubscriptionTypeQuery() {
  return useQuery<SubscriptionTypeResponse, AxiosError>({
    queryKey: ['fix-suggestions', 'service-info', 'subscription-type'],
    queryFn: getFixSuggestionSubscriptionType,
  });
}

export function useUpdateFeatureEnablementMutation() {
  const queryClient = useQueryClient();
  const intl = useIntl();
  return useMutation<
    Awaited<ReturnType<typeof updateFeatureEnablement>>,
    AxiosError<AIError>,
    { config: AIFeatureEnablement; prevState: AIFeatureEnablement }
  >({
    mutationFn: (data: { config: AIFeatureEnablement; prevState: AIFeatureEnablement }) =>
      updateFeatureEnablement(data.config),
    onSuccess: (_, param) => {
      queryClient.removeQueries({ queryKey: ['fix-suggestions'] });
      if (
        param.config.enablement !== AiCodeFixFeatureEnablement.disabled &&
        param.prevState.enablement === AiCodeFixFeatureEnablement.disabled
      ) {
        addGlobalSuccessMessage(intl.formatMessage({ id: 'aicodefix.updated' }, { 0: 'enabled' }));
      } else if (
        param.config.enablement === AiCodeFixFeatureEnablement.disabled &&
        param.prevState.enablement !== AiCodeFixFeatureEnablement.disabled
      ) {
        addGlobalSuccessMessage(intl.formatMessage({ id: 'aicodefix.updated' }, { 0: 'disabled' }));
      } else {
        addGlobalSuccessMessage(intl.formatMessage({ id: 'aicodefix.updated' }, { 0: 'updated' }));
      }
    },
    onError: (err) => {
      if (err.message !== undefined) {
        addGlobalErrorMessage(
          intl.formatMessage({ id: 'aicodefix.update_error' }, { 0: err.message }),
        );
      }
    },
  });
}

export function useGetFeatureEnablementQuery() {
  return useQuery({
    queryKey: ['fix-suggestions', 'config'],
    queryFn: () => getFeatureEnablement(),
    staleTime: Infinity,
  });
}

export function useGetLlmProvidersQuery() {
  return useQuery({
    queryKey: ['fix-suggestions', 'llm-providers'],
    queryFn: () => getLlmProviders(),
    staleTime: Infinity,
  });
}
