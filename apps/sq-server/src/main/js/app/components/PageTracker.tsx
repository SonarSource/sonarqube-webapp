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

import { type PropsWithChildren, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { installScript } from '~sq-server-commons/helpers/extensions';
import { getWebAnalyticsPageHandlerFromCache } from '~sq-server-commons/helpers/extensionsHandler';
import { getInstance } from '~sq-server-commons/helpers/system';

export function PageTracker({ children }: Readonly<PropsWithChildren<{}>>) {
  const appState = useAppState();
  const location = useLocation();
  const lastTrackedPath = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (appState.webAnalyticsJsPath && !getWebAnalyticsPageHandlerFromCache()) {
      installScript(appState.webAnalyticsJsPath, 'head');
    }
  }, [appState.webAnalyticsJsPath]);

  useEffect(() => {
    const webAnalyticsPageChange = getWebAnalyticsPageHandlerFromCache();
    if (webAnalyticsPageChange && location.pathname !== lastTrackedPath.current) {
      lastTrackedPath.current = location.pathname;
      const path = location.pathname;
      const timer = setTimeout(() => {
        webAnalyticsPageChange(path);
      }, 500);
      return () => {
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [location.pathname]);

  return (
    <Helmet defaultTitle={getInstance()} defer={false}>
      {children}
    </Helmet>
  );
}
