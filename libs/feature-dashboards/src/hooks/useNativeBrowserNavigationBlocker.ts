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

import { useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';

import { useNavigationBlockerEffects } from '~shared/hooks/useNavigationBlockerEffects';

export function useNativeBrowserNavigationBlocker(shouldBlock: boolean): void {
  const { formatMessage } = useIntl();

  const onLinkNavigation = useCallback(
    (link: HTMLAnchorElement) => {
      // eslint-disable-next-line no-alert
      const shouldNavigate = globalThis.confirm(
        formatMessage({
          id: 'hook.use_native_browser_navigation_blocker.exit_without_saving_message',
        }),
      );

      if (shouldNavigate) {
        globalThis.location.href = link.href;
      }

      return shouldNavigate;
    },
    [formatMessage],
  );

  const isNavigatingRef = useNavigationBlockerEffects({
    onLinkNavigation,
    shouldBlock,
  });

  useEffect(() => {
    if (!shouldBlock) {
      return undefined;
    }

    const currentState = (globalThis.history.state ?? {}) as Record<string, unknown>;
    globalThis.history.pushState({ ...currentState, navigationBlocked: true }, '');

    const handlePopState = () => {
      if (shouldBlock) {
        globalThis.history.pushState({ ...currentState, navigationBlocked: true }, '');

        // eslint-disable-next-line no-alert
        const shouldNavigate = globalThis.confirm(
          formatMessage({
            id: 'hook.use_native_browser_navigation_blocker.exit_without_saving_message',
          }),
        );

        if (shouldNavigate) {
          isNavigatingRef.current = true;
          globalThis.history.back();
        }
      }
    };

    globalThis.addEventListener('popstate', handlePopState);
    return () => {
      globalThis.removeEventListener('popstate', handlePopState);
      const state = globalThis.history.state as Record<string, unknown> | null;
      if (state?.navigationBlocked) {
        globalThis.history.back();
      }
    };
  }, [formatMessage, isNavigatingRef, shouldBlock]);
}
