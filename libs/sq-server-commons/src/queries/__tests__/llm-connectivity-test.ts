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

import { useQueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { getContextWrapper } from '~adapters/helpers/test-utils';
import { validateLlmProvider } from '../../api/llm-connectivity';
import { useLlmProviderValidationsQuery } from '../llm-connectivity';

jest.mock('../../api/llm-connectivity', () => ({
  ...jest.requireActual<typeof import('../../api/llm-connectivity')>('../../api/llm-connectivity'),
  validateLlmProvider: jest.fn(),
}));

describe('useLlmProviderValidationsQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('drops a stale "valid" verdict once a recheck fails, instead of keeping the old result', async () => {
    const providerId = 'provider-1';
    jest
      .mocked(validateLlmProvider)
      .mockResolvedValueOnce({ error: null, isValid: true, llmProviderId: providerId });

    const { result } = renderHook(
      () => {
        const client = useQueryClient();

        return { client, validations: useLlmProviderValidationsQuery([providerId]) };
      },
      { wrapper: getContextWrapper() },
    );

    await waitFor(() => {
      expect(result.current.validations.get(providerId)?.validation?.isValid).toBe(true);
    });

    jest.mocked(validateLlmProvider).mockRejectedValueOnce(new Error('network error'));

    // Trigger a recheck of the already-successful query, the same way re-opening the page does
    // (`refetchOnMount: 'always'`).
    result.current.client.refetchQueries({ queryKey: ['llm-connectivity'] });

    await waitFor(() => {
      expect(validateLlmProvider).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(result.current.validations.get(providerId)?.isFetching).toBe(false);
    });

    // The row must show "unknown" (no validation), not the stale "valid" result from before the
    // failed recheck.
    expect(result.current.validations.get(providerId)?.validation).toBeUndefined();
  });
});
