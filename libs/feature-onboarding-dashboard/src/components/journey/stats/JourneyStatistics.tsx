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

import { IconLink, LoadingContainer, MessageCallout } from '@sonarsource/echoes-react';
import { ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Path } from 'react-router';
import { useCreateDevopsConfigurationUrl } from '~adapters/helpers/useCreateDevopsConfigurationUrl';
import { JourneyLevel, OnboardingTimelinePoint } from '~shared/types/onboarding';
import { OnboardingDashboardAction } from '~shared/types/onboarding-dashboard-telemetry';
import { OverTimeCardSkeleton } from '../../OnboardingDashboardSkeleton';
import { LockedStatisticsCard } from './LockedStatisticsCard';
import { OnboardingOverTimeCard } from './OnboardingOverTimeCard';

/**
 * Copy — and the CTA decoration — of the "locked statistics" placeholder shown at each journey
 * level. Levels that have nothing left to unlock are absent from the map.
 */
const LOCKED_STATISTICS_CONTENT: Partial<
  Record<
    JourneyLevel,
    {
      cta: string;
      ctaAction: OnboardingDashboardAction;
      ctaPrefix?: ReactNode;
      message: string;
      title: string;
    }
  >
> = {
  [JourneyLevel.Unbound]: {
    cta: 'onboarding_dashboard.journey.locked.stats.cta',
    ctaAction: OnboardingDashboardAction.BindOrganization,
    ctaPrefix: <IconLink />,
    message: 'onboarding_dashboard.journey.locked.stats.message',
    title: 'onboarding_dashboard.journey.locked.stats.title',
  },
  [JourneyLevel.BoundNoImport]: {
    cta: 'onboarding_dashboard.journey.locked.more.cta',
    ctaAction: OnboardingDashboardAction.OpenRepositoriesImport,
    message: 'onboarding_dashboard.journey.locked.more.message',
    title: 'onboarding_dashboard.journey.locked.more.title',
  },
};

interface Props {
  /** Whether the organization is bound to a DevOps platform, `undefined` while it is loading. */
  isBound: boolean | undefined;
  isTimelineError: boolean;
  /** Adoption history from the statistics endpoint, `undefined` while it is loading. */
  timeline: OnboardingTimelinePoint[] | undefined;
}

/**
 * The statistics unlocked at the current level: locked while unbound, then the timeline, with the
 * imported series once it records an import. Derived from the binding and the statistics endpoint
 * only, so it does not wait on the overview.
 */
export function JourneyStatistics({ isBound, isTimelineError, timeline }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const createConfigurationUrl = useCreateDevopsConfigurationUrl();

  const level = getStatisticsLevel({ isBound, timeline });
  const lockedStatistics = level === undefined ? undefined : LOCKED_STATISTICS_CONTENT[level];

  // Unbound is the only level whose CTA has a destination today — and only on the products that
  // expose one, which is what the adapter answers. The "import repositories" destination lands in a
  // follow-up PR, so that CTA stays inert.
  const lockedCtaUrlByLevel: Partial<Record<JourneyLevel, Partial<Path> | undefined>> = {
    [JourneyLevel.Unbound]: createConfigurationUrl,
  };

  const isLoading = level === undefined && !(isBound === true && isTimelineError);

  return (
    <LoadingContainer
      className="sw:flex sw:flex-col sw:gap-6"
      isLoading={isLoading}
      loadingMessage={formatMessage({ id: 'onboarding_dashboard.loading' })}
    >
      {isBound !== false && (
        <TimelineSlot
          isBound={isBound}
          isTimelineError={isTimelineError}
          level={level}
          timeline={timeline}
        />
      )}

      {lockedStatistics !== undefined && level !== undefined && (
        <LockedStatisticsCard
          ctaAction={lockedStatistics.ctaAction}
          ctaLabel={formatMessage({ id: lockedStatistics.cta })}
          ctaPrefix={lockedStatistics.ctaPrefix}
          ctaTo={lockedCtaUrlByLevel[level]}
          message={formatMessage({ id: lockedStatistics.message })}
          title={formatMessage({ id: lockedStatistics.title })}
        />
      )}
    </LoadingContainer>
  );
}

function getStatisticsLevel({
  isBound,
  timeline,
}: Pick<Props, 'isBound' | 'timeline'>): JourneyLevel | undefined {
  if (isBound === false) {
    return JourneyLevel.Unbound;
  }

  if (isBound === undefined || timeline === undefined) {
    return undefined;
  }

  return timeline.some(({ repositoriesImported }) => repositoriesImported > 0)
    ? JourneyLevel.Imported
    : JourneyLevel.BoundNoImport;
}

interface TimelineSlotProps extends Props {
  level: JourneyLevel | undefined;
}

function TimelineSlot({ isBound, isTimelineError, level, timeline }: Readonly<TimelineSlotProps>) {
  // Until the binding is known the timeline may not apply at all, so an error would be premature.
  if (isBound === undefined) {
    return <OverTimeCardSkeleton />;
  }

  if (isTimelineError) {
    return (
      <MessageCallout variety="danger">
        <FormattedMessage id="default_error_message" />
      </MessageCallout>
    );
  }

  if (level === undefined || timeline === undefined) {
    return <OverTimeCardSkeleton />;
  }

  return (
    <OnboardingOverTimeCard
      showImportedSeries={level === JourneyLevel.Imported}
      timeline={timeline}
    />
  );
}
