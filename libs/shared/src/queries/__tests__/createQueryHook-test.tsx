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

import { QueryClient, QueryClientProvider, queryOptions } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { EntitlementCheckQueryFunctionType } from '../../queries/entitlement-checks';
import { EntitlementCheckFeatureKey } from '../../types/billing';
import { Rule } from '../../types/rules';
import { createQueryHook, StaleTime } from '../common';

const fetchCount = jest.fn((key: string) => Promise.resolve({ count: key.length }));

const useCountQuery = createQueryHook((key: string) =>
  queryOptions({
    queryKey: ['count', key],
    queryFn: () => fetchCount(key),
    staleTime: StaleTime.LIVE,
  }),
);

const useTotalCountQuery = createQueryHook(() =>
  queryOptions({
    queryKey: ['count'],
    queryFn: () => fetchCount('total'),
    staleTime: StaleTime.LIVE,
  }),
);

const useEntitlementCheckQuery: EntitlementCheckQueryFunctionType = createQueryHook(
  (params: { featureKey: EntitlementCheckFeatureKey }) =>
    queryOptions({
      queryKey: ['entitlement-check', params.featureKey],
      staleTime: StaleTime.LIVE,
      queryFn: () =>
        Promise.resolve({
          featureKey: params.featureKey,
          entitled: true,
          consumption: null,
          value: null,
          excludedValues: [],
        }),
    }),
);

let queryClient: QueryClient;

function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  // eslint-disable-next-line local-rules/no-query-client-imports
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  jest.clearAllMocks();
});

describe('createQueryHook enabled option', () => {
  it('runs the query when enabled is omitted', async () => {
    const { result } = renderHook(
      () => useCountQuery('omitted', { select: (data) => data.count }),
      { wrapper: Wrapper },
    );

    await waitFor(() => {
      expect(result.current.data).toBe(7);
    });
  });

  it('does not run the query when enabled is a defined false value', () => {
    const props: { enabled?: boolean; project?: Pick<Rule, 'isTemplate'> } = {};
    const isReady = (): boolean => false;
    const passedOptions: { enabled?: boolean; staleTime?: number } = { enabled: false };

    renderHook(
      () => {
        useCountQuery('literal', { enabled: false });
        useCountQuery('boolean-call', { enabled: Boolean(props.enabled) });
        useCountQuery('double-negation', { enabled: !!props.project?.isTemplate });
        useCountQuery('function', { enabled: isReady() });
        useCountQuery('callback', { enabled: () => false });
        useCountQuery('passed-options', passedOptions);
        useCountQuery('not-suspense', { enabled: false, isSuspense: false });
        useTotalCountQuery({ enabled: false });
        useEntitlementCheckQuery(
          { featureKey: EntitlementCheckFeatureKey.AdvancedSecurity },
          { enabled: false },
        );
      },
      { wrapper: Wrapper },
    );

    expect(fetchCount).not.toHaveBeenCalled();
  });

  it('rejects a possibly undefined enabled value at compile time, as undefined runs the query', async () => {
    const props: { enabled?: boolean; project?: Pick<Rule, 'isTemplate'> } = {};
    const { enabled } = props;
    const isReady = (): boolean | undefined => undefined;
    const maybeEnabled: boolean | undefined = props.enabled;

    renderHook(
      () => {
        useCountQuery('undefined', {
          // @ts-expect-error enabled must not be undefined
          enabled: undefined,
        });
        useCountQuery('variable', {
          // @ts-expect-error enabled can be undefined
          enabled: maybeEnabled,
        });
        useCountQuery('optional-prop', {
          // @ts-expect-error enabled can be undefined
          enabled: props.enabled,
        });
        useCountQuery('destructured', {
          // @ts-expect-error enabled can be undefined
          enabled,
        });
        useCountQuery('interface-from-another-file', {
          // @ts-expect-error enabled can be undefined
          enabled: props.project?.isTemplate,
        });
        useCountQuery('function', {
          // @ts-expect-error enabled can be undefined
          enabled: isReady(),
        });
        useCountQuery('not-suspense', {
          // @ts-expect-error enabled can be undefined
          enabled: maybeEnabled,
          isSuspense: false,
        });
        useCountQuery('with-select', {
          // @ts-expect-error enabled can be undefined
          enabled: maybeEnabled,
          select: (data) => data.count,
        });
        useTotalCountQuery({
          // @ts-expect-error enabled can be undefined
          enabled: maybeEnabled,
        });
      },
      { wrapper: Wrapper },
    );

    await waitFor(() => {
      expect(fetchCount).toHaveBeenCalledTimes(9);
    });
  });

  it('still rejects unknown options at compile time, so a misspelled enabled does not slip through', async () => {
    renderHook(
      () =>
        useCountQuery('misspelled', {
          // @ts-expect-error enable is not a query option
          enable: false,
        }),
      { wrapper: Wrapper },
    );

    await waitFor(() => {
      expect(fetchCount).toHaveBeenCalledWith('misspelled');
    });
  });

  it('rejects a possibly undefined enabled value in the entitlement check adapter type', async () => {
    const maybeEnabled: boolean | undefined = undefined;

    const { result } = renderHook(
      () =>
        useEntitlementCheckQuery(
          { featureKey: EntitlementCheckFeatureKey.AdvancedSecurity },
          {
            // @ts-expect-error enabled can be undefined
            enabled: maybeEnabled,
          },
        ),
      { wrapper: Wrapper },
    );

    await waitFor(() => {
      expect(result.current.data?.entitled).toBe(true);
    });
  });
});
