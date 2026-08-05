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

import { renderHook, waitFor } from '@testing-library/react';
import { getContextWrapper } from '~adapters/helpers/test-utils';
import { EntitlementCheckFeatureKey } from '~shared/types/billing';
// Relative import on purpose: commercial jest maps ~sq-server-addons to private.
import { useEntitlementCheckQuery, useEntitlementChecksQuery } from '../entitlements';

const wrapper = getContextWrapper();

describe('community entitlement stubs', () => {
  it('resolves a single feature as not entitled', async () => {
    const { result } = renderHook(
      () => useEntitlementCheckQuery({ featureKey: EntitlementCheckFeatureKey.RemediationAgent }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.data).toEqual({
        featureKey: EntitlementCheckFeatureKey.RemediationAgent,
        entitled: false,
        consumption: null,
        value: null,
        excludedValues: [],
      });
    });
  });

  it('fans out not-entitled results for usable keys only', async () => {
    const { result } = renderHook(
      () =>
        useEntitlementChecksQuery([
          EntitlementCheckFeatureKey.LinesOfCode,
          EntitlementCheckFeatureKey.HunterAgent,
        ]),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.data).toEqual([
      {
        featureKey: EntitlementCheckFeatureKey.LinesOfCode,
        entitled: false,
        consumption: null,
        value: null,
        excludedValues: [],
      },
      {
        featureKey: EntitlementCheckFeatureKey.HunterAgent,
        entitled: false,
        consumption: null,
        value: null,
        excludedValues: [],
      },
    ]);
    expect(result.current.isError).toBe(false);
  });

  it('skips empty feature keys', async () => {
    const { result } = renderHook(() => useEntitlementChecksQuery([]), { wrapper });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.data).toEqual([]);
  });
});
