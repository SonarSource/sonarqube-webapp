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

const { RuleTester } = require('eslint');
const useProperQueryName = require('../use-proper-query-name');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run('use-proper-query-name', useProperQueryName, {
  valid: [
    {
      code: `
      export function useBadgeTokenQuery(componentKey: string) {
        return useQuery({
          queryKey: ['badges-token', componentKey] as const,
          queryFn: ({ queryKey: [_, key] }) => getProjectBadgesToken(key),
        });
      }
      `,
      filename: 'src/queries/goodUseQuery.ts',
    },
    {
      code: `
      import { useQuery, useQueryClient, useMutation } from 'react-query';
      `,
      filename: 'src/queries/goodImport.ts',
    },
    {
      code: `
      export function useBadgeToken(componentKey: string) {
        return useQuery({
          queryKey: ['badges-token', componentKey] as const,
          queryFn: ({ queryKey: [_, key] }) => getProjectBadgesToken(key),
        });
      }
      `,
      filename: 'src/ignore/wrongDirectUseQuery.ts',
    },
    {
      code: `
      function invalidateIssueChangelog(issueKey, queryClient) {
        queryClient.invalidateQueries({ queryKey: issuesQuery.changelog(issueKey) });
      }
      `,
      filename: 'src/queries/wrongDirectUseMutation.ts',
    },
  ],
  invalid: [
    {
      code: `
      export function useBadgeToken(componentKey: string) {
        return useQuery({
          queryKey: ['badges-token', componentKey] as const,
          queryFn: ({ queryKey: [_, key] }) => getProjectBadgesToken(key),
        });
      }
      `,
      errors: [{ messageId: 'useProperQueryName' }],
      filename: 'src/queries/wrongDirectUseQuery.ts',
    },
    {
      code: `
      export function useBadgeMetrics() {
        const { data: webservices = [], isLoading: isLoadingWebApi } = useWebApiQuery();
        const { data: isStandardExperience, isLoading: isLoadingMode } = useStandardExperienceModeQuery();
        const domain = webservices.find((d) => d.path === 'api/project_badges');
        const ws = domain?.actions.find((w) => w.key === 'measure');
        const param = ws?.params?.find((p) => p.key === 'metric');
        if (param?.possibleValues && !isLoadingMode) {
          return {
            isLoading: false,
            data: uniq(
              param.possibleValues.map((metric: MetricKey) => {
                return (
                  (isStandardExperience ? MQR_CONDITIONS_MAP[metric] : STANDARD_CONDITIONS_MAP[metric]) ??
                  metric
                );
              }),
            ).map((metric) => ({
              value: metric,
              label: localizeMetric(metric),
            })),
          };
        }
        return { isLoading: isLoadingWebApi || isLoadingMode, data: [] };
      }
      `,
      errors: [{ messageId: 'useProperQueryName' }, { messageId: 'useProperQueryName' }],
      filename: 'src/queries/wrongNestedUseQuery.ts',
    },
    {
      code: `
      export function useRenewBadgeToken() {
          const queryClient = useQueryClient();
          return useMutation({
              mutationFn: async (key: string) => {
                  await renewProjectBadgesToken(key);
              },
              onSuccess: (_, key) => {
                  queryClient.invalidateQueries({ queryKey: ['badges-token', key], refetchType: 'all' });
              },
          });
      }
      `,
      errors: [{ messageId: 'useProperMutationName' }],
      filename: 'src/queries/wrongDirectUseMutation.ts',
    },
    {
      code: `
      function invalidateIssueChangelogQuery(issueKey, queryClient) {
        queryClient.invalidateQueries({ queryKey: issuesQuery.changelog(issueKey) });
      }
      function invalidateIssueChangelogQueries(issueKey, queryClient) {
        queryClient.invalidateQueries({ queryKey: issuesQuery.changelog(issueKey) });
      }
      `,
      errors: [
        { messageId: 'useProperInvalidationName' },
        { messageId: 'useProperInvalidationName' },
      ],
      filename: 'src/queries/wrongDirectUseMutation.ts',
    },
  ],
});
