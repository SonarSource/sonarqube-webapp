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

import { Card, Divider, LoadingSkeleton, Text, TextSize } from '@sonarsource/echoes-react';

/** Header progress ring, matching the 56px donut rendered by OnboardingDashboardHeader. */
const HEADER_DONUT_SIZE = 'sw-h-[56px] sw-w-[56px]';
/** Step-card visual slot, matching the 64px donut rendered by StepCard. */
const STEP_DONUT_SIZE = 'sw-h-[64px] sw-w-[64px]';
/** Detail-panel donut, matching the 150px donut rendered by PanelDonut. */
const PANEL_DONUT_SIZE = 'sw-h-[150px] sw-w-[150px]';
/** Plot area of the over-time chart, matching its MIN_HEIGHT. */
const OVER_TIME_CHART_HEIGHT = 'sw-h-[200px]';

/** Card header placeholder: a title line and a subtle description line. */
function CardHeaderSkeleton() {
  return (
    <Card.Header
      description={<LoadingSkeleton className="sw-w-64" variety="text" />}
      title={<LoadingSkeleton className="sw-w-40" variety="text" />}
    />
  );
}

/** Page-header placeholder: the progress ring next to the page title and tagline. */
function HeaderSkeleton() {
  return (
    <div className="sw-mb-12 sw-flex sw-items-center sw-gap-4">
      <LoadingSkeleton className={`${HEADER_DONUT_SIZE} sw-shrink-0`} variety="disk" />
      <div className="sw-flex sw-flex-col sw-gap-1">
        <LoadingSkeleton className="sw-h-8 sw-w-64" variety="rectangle" />
        <LoadingSkeleton className="sw-w-80" variety="text" />
      </div>
    </div>
  );
}

/** One stepper card placeholder: the visual slot next to a title and a subtle caption. */
function StepCardSkeleton() {
  return (
    <Card className="sw-min-w-0">
      <Card.Body className="sw-flex sw-items-center">
        <div className="sw-flex sw-items-center sw-gap-4 sw-py-2">
          <LoadingSkeleton className={`${STEP_DONUT_SIZE} sw-shrink-0`} variety="disk" />
          <div className="sw-flex sw-min-w-0 sw-flex-col sw-gap-1">
            <LoadingSkeleton className="sw-w-32" variety="text" />
            <Text isSubtle size={TextSize.Small}>
              <LoadingSkeleton className="sw-w-16" variety="text" />
            </Text>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

/** One action-row placeholder inside the detail panel: icon, title/description lines and a CTA. */
function PanelActionRowSkeleton() {
  return (
    <Card>
      <Card.Body>
        <div className="sw-flex sw-items-center sw-justify-between sw-gap-4">
          <div className="sw-flex sw-min-w-0 sw-items-start sw-gap-2">
            <div className="sw-pt-1">
              <LoadingSkeleton className="sw-h-3 sw-w-3" variety="disk" />
            </div>
            <div className="sw-flex sw-min-w-0 sw-flex-col sw-gap-1">
              <LoadingSkeleton className="sw-w-48" variety="text" />
              <Text isSubtle size={TextSize.Small}>
                <LoadingSkeleton className="sw-w-64" variety="text" />
              </Text>
            </div>
          </div>

          <LoadingSkeleton className="sw-h-6 sw-w-24 sw-shrink-0" variety="rectangle" />
        </div>
      </Card.Body>
    </Card>
  );
}

/**
 * Detail-panel placeholder: the panel donut and its legend on the left, the heading, description and
 * action rows on the right.
 */
function DetailPanelSkeleton() {
  return (
    <Card>
      <Card.Body>
        <div className="sw-flex sw-items-start sw-gap-8">
          <div className="sw-flex sw-shrink-0 sw-flex-col sw-items-center sw-gap-4">
            <LoadingSkeleton className={PANEL_DONUT_SIZE} variety="disk" />
            <div className="sw-flex sw-gap-4">
              {Array.from({ length: 2 }, (_, index) => (
                <LoadingSkeleton className="sw-w-16" key={`panel-legend-${index}`} variety="text" />
              ))}
            </div>
          </div>

          <div className="sw-flex sw-min-w-0 sw-flex-1 sw-flex-col sw-gap-4">
            <LoadingSkeleton className="sw-h-6 sw-w-48" variety="rectangle" />
            <LoadingSkeleton className="sw-w-80" variety="text" />

            <div className="sw-flex sw-flex-col sw-gap-3">
              {Array.from({ length: 3 }, (_, index) => (
                <PanelActionRowSkeleton key={`panel-row-${index}`} />
              ))}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

/** "Onboarding over time" placeholder: the plot area above the series legend. */
function OverTimeCardSkeleton() {
  return (
    <Card>
      <CardHeaderSkeleton />
      <Card.Body>
        <div className="sw-flex sw-flex-col sw-gap-4">
          <LoadingSkeleton className={`${OVER_TIME_CHART_HEIGHT} sw-w-full`} variety="rectangle" />
          <div className="sw-flex sw-gap-2">
            {Array.from({ length: 2 }, (_, index) => (
              <LoadingSkeleton className="sw-w-32" key={`series-${index}`} variety="text" />
            ))}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

/**
 * "All projects" placeholder: the search and filter controls above a block standing in for the
 * table. The real table renders its own row skeletons, driven by its own query.
 */
function AllProjectsCardSkeleton() {
  return (
    <Card>
      <CardHeaderSkeleton />
      <Card.Body>
        <div className="sw-flex sw-flex-col sw-gap-4">
          <div className="sw-flex sw-items-center sw-justify-between">
            <div className="sw-flex sw-items-center sw-gap-4">
              <LoadingSkeleton className="sw-h-8 sw-w-64" variety="rectangle" />
              <LoadingSkeleton className="sw-h-8 sw-w-72" variety="rectangle" />
            </div>
            <LoadingSkeleton className="sw-w-24" variety="text" />
          </div>

          <LoadingSkeleton className="sw-h-64 sw-w-full" variety="rectangle" />
        </div>
      </Card.Body>
    </Card>
  );
}

/** One DevOps-platform placeholder row: icon + name, two counts and a share bar. */
function DevopsRowSkeleton() {
  return (
    <div className="sw-flex sw-flex-col sw-gap-2 sw-py-3">
      <div className="sw-flex sw-items-center sw-justify-between">
        <div className="sw-flex sw-shrink-0 sw-items-center sw-gap-2 sw-w-[150px]">
          <LoadingSkeleton className="sw-h-5 sw-w-5" variety="disk" />
          <LoadingSkeleton className="sw-w-24" variety="text" />
        </div>
        <LoadingSkeleton className="sw-w-10" variety="text" />
        <LoadingSkeleton className="sw-w-10" variety="text" />
      </div>

      <LoadingSkeleton className="sw-h-2 sw-w-full" variety="rectangle" />
    </div>
  );
}

/**
 * Full-page loading placeholder for the onboarding dashboard. Mirrors the journey layout — header,
 * stepper, detail panel, over-time chart, all-projects table and the DevOps platforms card — so the
 * layout stays stable when data arrives. Meant to render inside a LoadingContainer, from which every
 * skeleton reads its `isLoading` state.
 */
export function OnboardingDashboardSkeleton() {
  return (
    <div>
      <HeaderSkeleton />

      <div className="sw-mb-4 sw-grid sw-grid-cols-3 sw-gap-4">
        {Array.from({ length: 3 }, (_, index) => (
          <StepCardSkeleton key={`step-${index}`} />
        ))}
      </div>

      <div className="sw-mb-4">
        <DetailPanelSkeleton />
      </div>

      <Divider className="sw-mb-4" />

      <div className="sw-flex sw-flex-col sw-gap-4">
        <OverTimeCardSkeleton />

        <AllProjectsCardSkeleton />

        <Card className="sw-min-w-0">
          <CardHeaderSkeleton />
          <Card.Body>
            <div className="sw-flex sw-flex-col">
              {Array.from({ length: 4 }, (_, index) => (
                <DevopsRowSkeleton key={`devops-${index}`} />
              ))}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
