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

import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef } from 'react';
import { useOnboardingDashboardTelemetry } from '~adapters/helpers/useOnboardingDashboardTelemetry';
import { uuidv4 } from '~shared/helpers/crypto';
import { JourneyState, JourneyStep, OnboardingProject } from '~shared/types/onboarding';
import {
  OnboardingDashboardAction,
  OnboardingDashboardBlockedReason,
  OnboardingDashboardFilter,
  OnboardingDashboardSurface,
  OnboardingDashboardTelemetryScope,
  RepositoriesImportMethod,
} from '~shared/types/onboarding-dashboard-telemetry';

const OnboardingDashboardTelemetryContext = createContext<OnboardingDashboardTelemetryScope>({
  visitId: '',
});

/** Starts a dashboard visit: every event sent below it shares the same visit identifier. */
export function OnboardingDashboardTelemetryProvider({ children }: Readonly<PropsWithChildren>) {
  const scope = useMemo(() => ({ visitId: uuidv4() }), []);

  return (
    <OnboardingDashboardTelemetryContext.Provider value={scope}>
      {children}
    </OnboardingDashboardTelemetryContext.Provider>
  );
}

/** Tags the events sent below it with the part of the dashboard they come from. */
export function OnboardingDashboardSurfaceProvider({
  children,
  surface,
}: Readonly<PropsWithChildren<{ surface: OnboardingDashboardSurface }>>) {
  const { visitId } = useContext(OnboardingDashboardTelemetryContext);
  const scope = useMemo(() => ({ surface, visitId }), [surface, visitId]);

  return (
    <OnboardingDashboardTelemetryContext.Provider value={scope}>
      {children}
    </OnboardingDashboardTelemetryContext.Provider>
  );
}

export function useOnboardingDashboardTracking() {
  const scope = useContext(OnboardingDashboardTelemetryContext);
  const telemetry = useOnboardingDashboardTelemetry();

  return useMemo(
    () => ({
      trackActionBlocked: (action: OnboardingDashboardAction) => {
        telemetry.trackActionBlocked({
          ...scope,
          action,
          reason: OnboardingDashboardBlockedReason.MissingCreateProjectsPermission,
        });
      },
      trackActionSelected: (action: OnboardingDashboardAction, project?: OnboardingProject) => {
        telemetry.trackActionSelected({ ...scope, action, project });
      },
      trackFilterChanged: (filter: OnboardingDashboardFilter, value: string) => {
        telemetry.trackFilterChanged({ ...scope, filter, value });
      },
      trackImportRequested: (
        importMethod: RepositoriesImportMethod,
        importRequestId: string,
        selectedCount?: number,
      ) => {
        telemetry.trackImportRequested({ ...scope, importMethod, importRequestId, selectedCount });
      },
      trackStepSelected: (previousStep: JourneyStep, selectedStep: JourneyStep) => {
        telemetry.trackStepSelected({ ...scope, previousStep, selectedStep });
      },
      trackViewed: (journeyState?: JourneyState) => {
        telemetry.trackViewed({ ...scope, journeyState });
      },
    }),
    [scope, telemetry],
  );
}

/** Sends the dashboard view once per visit, as soon as the journey has loaded or failed to. */
export function useTrackOnboardingDashboardViewed(
  journeyState: JourneyState | undefined,
  isPending: boolean,
) {
  const { trackViewed } = useOnboardingDashboardTracking();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (isPending || hasTracked.current) {
      return;
    }

    hasTracked.current = true;
    trackViewed(journeyState);
  }, [isPending, journeyState, trackViewed]);
}
