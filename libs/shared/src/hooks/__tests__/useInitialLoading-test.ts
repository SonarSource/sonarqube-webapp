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

import { renderHook } from '@testing-library/react';
import { useInitialLoading } from '../useInitialLoading';

it('uses the initial loading presentation once per entity, including empty resolution', () => {
  const { result, rerender } = renderHook(
    ({ isLoading, entityId }) => useInitialLoading(isLoading, entityId),
    { initialProps: { isLoading: true, entityId: 'enterprise-a' } },
  );

  expect(result.current).toBe(true);
  rerender({ isLoading: false, entityId: 'enterprise-a' });
  expect(result.current).toBe(false);
  rerender({ isLoading: true, entityId: 'enterprise-a' });
  expect(result.current).toBe(false);

  rerender({ isLoading: true, entityId: 'enterprise-b' });
  expect(result.current).toBe(true);
  rerender({ isLoading: false, entityId: 'enterprise-b' });
  expect(result.current).toBe(false);
  rerender({ isLoading: true, entityId: 'enterprise-b' });
  expect(result.current).toBe(false);
});

it('keeps cached content when the new entity has already resolved', () => {
  const { result, rerender } = renderHook(
    ({ isLoading, entityId }) => useInitialLoading(isLoading, entityId),
    { initialProps: { isLoading: false, entityId: 'enterprise-a' } },
  );

  expect(result.current).toBe(false);
  rerender({ isLoading: false, entityId: 'enterprise-b' });
  expect(result.current).toBe(false);
  rerender({ isLoading: true, entityId: 'enterprise-b' });
  expect(result.current).toBe(false);
});
