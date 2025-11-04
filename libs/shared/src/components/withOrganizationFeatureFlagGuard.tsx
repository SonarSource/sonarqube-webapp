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

import { Spinner } from '@sonarsource/echoes-react';
import { useFlags } from '~adapters/helpers/feature-flags';
import { shouldWaitForOrganizationContext } from '~adapters/helpers/organization';
import NotFound from './NotFound';

interface WithOrganizationFeatureFlagGuardOptions {
  requiredFlags: string[];
}

/**
 * HOC that wraps a component with feature flag logic.
 * Shows loading state while waiting for organization context,
 * and redirects to fallback if required flags are false.
 *
 * @param WrappedComponent - The component to wrap
 * @param options - Configuration for feature flag checking
 * @returns Wrapped component with feature flag logic
 */
export function withOrganizationFeatureFlagGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithOrganizationFeatureFlagGuardOptions,
) {
  return function FeatureFlagGuardedComponent(props: P) {
    const flags = useFlags();
    const isWaitingForOrganizationContext = shouldWaitForOrganizationContext();

    // Show loading while waiting for context
    if (isWaitingForOrganizationContext) {
      return (
        <div className="sw-flex sw-items-center sw-justify-center sw-min-h-screen">
          <Spinner />
        </div>
      );
    }

    // Check if all required flags are enabled
    const allFlagsEnabled = options.requiredFlags.every((flagName) => {
      const flagValue = flags[flagName as keyof typeof flags] as boolean | undefined;
      return flagValue === true;
    });

    // Redirect to fallback if flags are false
    if (!allFlagsEnabled) {
      return <NotFound />;
    }

    return <WrappedComponent {...props} />;
  };
}
