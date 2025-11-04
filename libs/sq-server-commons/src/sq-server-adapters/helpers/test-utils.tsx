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

import { EchoesProvider } from '@sonarsource/echoes-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode, useMemo } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { IntlProvider, ReactIntlErrorCode } from 'react-intl';
import { AnalysisContext } from '~shared/context/AnalysisContext';
import { optionalContexts } from '~shared/helpers/context';
import { isDefined } from '~shared/helpers/types';
import { LightComponent } from '~shared/types/component';
import { AvailableFeaturesContext } from '../../context/available-features/AvailableFeaturesContext';
import { ComponentContext } from '../../context/componentContext/ComponentContext';
import CurrentUserContextProvider from '../../context/current-user/CurrentUserContextProvider';
import { mockComponent } from '../../helpers/mocks/component';
import { Feature } from '../../types/features';
import { CurrentUser } from '../../types/users';

export { ComponentContext } from '../../context/componentContext/ComponentContext';

export interface ContextWrapperInitProps {
  analysisContext?: { branchId: string; organizationId?: string };
  availableFeatures?: string[];
  componentContext?: { component: LightComponent };
  initialCurrentUser?: CurrentUser;
}

export function getContextWrapper({
  initialCurrentUser = undefined,
  componentContext = undefined,
  analysisContext = undefined,
  availableFeatures = [],
}: ContextWrapperInitProps = {}) {
  return function ContextWrapper({ children }: React.PropsWithChildren<object>) {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    /** Assert all given features exist */
    const allFeatures = Object.values<string>(Feature);
    availableFeatures.forEach((f) => {
      if (!allFeatures.includes(f)) {
        throw new Error(
          `Invalid feature: ${f} -- available features are ${allFeatures.join(', ')}`,
        );
      }
    });

    // optional contexts are nested in the order provided to the array
    const providers = [
      {
        provider: AnalysisContext.Provider,
        value: useMemo(
          () => ({
            branchId: analysisContext?.branchId,
          }),
          [],
        ),
        enabled: isDefined(analysisContext),
      },
      {
        provider: ComponentContext.Provider,
        value: useMemo(
          () => ({
            onComponentChange: jest.fn(),
            fetchComponent: jest.fn(),
            component: componentContext && mockComponent({ ...componentContext.component }),
          }),
          [],
        ),
        enabled: isDefined(componentContext),
      },
      {
        provider: AvailableFeaturesContext.Provider,
        value: useMemo(() => availableFeatures, []),
        enabled: isDefined(availableFeatures) && availableFeatures.length > 0,
      },
    ];

    return (
      <HelmetProvider>
        <CurrentUserContextProvider currentUser={initialCurrentUser}>
          <IntlWrapper>
            <QueryClientProvider client={queryClient}>
              <EchoesProvider tooltipsDelayDuration={0}>
                {optionalContexts(providers, children)}
              </EchoesProvider>
            </QueryClientProvider>
          </IntlWrapper>
        </CurrentUserContextProvider>
      </HelmetProvider>
    );
  };
}

export function IntlWrapper({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <IntlProvider
      defaultLocale="en"
      locale="en"
      messages={{}}
      onError={(e) => {
        // ignore missing translations, there are none!
        if (
          e.code !== ReactIntlErrorCode.MISSING_TRANSLATION &&
          e.code !== ReactIntlErrorCode.UNSUPPORTED_FORMATTER
        ) {
          // eslint-disable-next-line no-console
          console.error(e);
        }
      }}
    >
      {children}
    </IntlProvider>
  );
}
