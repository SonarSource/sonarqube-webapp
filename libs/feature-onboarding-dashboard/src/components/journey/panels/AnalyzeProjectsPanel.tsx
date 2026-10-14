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

import {
  Badge,
  BadgeVariety,
  Button,
  ButtonVariety,
  Card,
  cssVar,
  Heading,
  HeadingSize,
  IconDot,
  Text,
  TextSize,
} from '@sonarsource/echoes-react';
import { ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { ImportRepositoriesCta } from '~adapters/components/onboarding/ImportRepositoriesCta';
import { IS_AUTOMATIC_ANALYSIS_SUPPORTED } from '~adapters/helpers/onboarding-actions';
import { JourneyState, OnboardingProjectScanStatus } from '~shared/types/onboarding';
import { PanelDonut, PanelDonutSegment } from '../charts/PanelDonut';
import { ConfigureProjectsModal } from '../modals/ConfigureProjectsModal';
import { PermissionGate } from '../PermissionGate';

interface Props {
  state: JourneyState;
}

function clampToRemaining(value: number, remaining: number) {
  return Math.max(Math.min(value, remaining), 0);
}

/**
 * "Analyze your projects" detail panel. Left: a donut breaking projects into analyzed, not scanned
 * and not-yet-imported (the analyzed segment is omitted when nothing has been analyzed yet),
 * centred on the analyzed percentage. "Analyzed" is the scan-status dimension, so it spans every
 * analysis mode the product supports — CI, locally run scanners, and automatic analysis on SQ-Cloud.
 * Right: action cards nudging the user to fix or import projects.
 *
 * On SQ-Cloud, when the backend reports the split, the analyzed segment is broken down by analysis
 * mode (CI scan, Autoscan, and the remainder as "Other analysis" for local scanners without CI).
 */
export function AnalyzeProjectsPanel({ state }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const { analyze, analyzed, analyzedPct, totalProjects } = state;

  const analyzedCapacity =
    totalProjects > 0 ? totalProjects - analyze.notScanned - analyze.notImported : analyzed;
  const analyzedSegmentValue = Math.max(Math.min(analyzed, analyzedCapacity), 0);

  const analyzedSegments: PanelDonutSegment[] = [];
  const { byMode } = analyze;

  if (IS_AUTOMATIC_ANALYSIS_SUPPORTED && byMode) {
    // Each segment is capped by what the previous ones left of `analyzedSegmentValue` (the analyzed
    // total, itself capped by the available space), so inconsistent counts never overflow the
    // donut nor go negative.
    const ciValue = clampToRemaining(byMode.ci, analyzedSegmentValue);
    const automaticValue = clampToRemaining(byMode.automatic, analyzedSegmentValue - ciValue);
    // Analyzed projects that are neither CI nor automatic: local scanners run without CI.
    const otherValue = clampToRemaining(
      analyzed - byMode.ci - byMode.automatic,
      analyzedSegmentValue - ciValue - automaticValue,
    );

    analyzedSegments.push(
      {
        color: cssVar('color-charts-categorical-3'),
        label: formatMessage({ id: 'onboarding_dashboard.journey.analyze.legend.ci_scan' }),
        value: ciValue,
      },
      {
        color: cssVar('color-charts-categorical-4'),
        label: formatMessage({ id: 'onboarding_dashboard.journey.analyze.legend.autoscan' }),
        value: automaticValue,
      },
      {
        color: cssVar('color-charts-categorical-1'),
        label: formatMessage({ id: 'onboarding_dashboard.journey.analyze.legend.other_analysis' }),
        value: otherValue,
      },
    );
  } else {
    analyzedSegments.push({
      color: cssVar('color-charts-categorical-3'),
      label: formatMessage({ id: 'onboarding_dashboard.journey.analyze.legend.analyzed' }),
      value: analyzedSegmentValue,
    });
  }

  const segments: PanelDonutSegment[] = [
    ...analyzedSegments.filter((segment) => segment.value > 0),
    {
      color: cssVar('color-charts-categorical-2'),
      label: formatMessage({ id: 'onboarding_dashboard.journey.analyze.legend.not_scanned' }),
      value: analyze.notScanned,
    },
    {
      color: cssVar('color-background-neutral-subtle-default'),
      label: formatMessage({ id: 'onboarding_dashboard.journey.analyze.legend.not_imported' }),
      value: analyze.notImported,
    },
  ];

  const rows: Array<{
    badge: ReactNode;
    cta: ReactNode;
    description: string;
    icon: ReactNode;
    key: string;
    titleId: string;
  }> = [
    {
      badge: (
        <Badge variety={BadgeVariety.Neutral}>
          {formatMessage(
            { id: 'onboarding_dashboard.journey.analyze.projects_count' },
            { count: analyze.notScanned },
          )}
        </Badge>
      ),
      cta: (
        <PermissionGate
          trigger={
            <Button variety={ButtonVariety.Primary}>
              {formatMessage({ id: 'onboarding_dashboard.journey.analyze.not_scanned.cta' })}
            </Button>
          }
        >
          {(trigger) => (
            <ConfigureProjectsModal defaultScanStatus={OnboardingProjectScanStatus.NotScanned}>
              {trigger}
            </ConfigureProjectsModal>
          )}
        </PermissionGate>
      ),
      description: formatMessage({ id: 'onboarding_dashboard.journey.analyze.not_scanned.desc' }),
      icon: <IconDot color="echoes-color-icon-danger" isFilled />,
      key: 'not-scanned',
      titleId: 'onboarding_dashboard.journey.analyze.not_scanned.title',
    },
    {
      // Counted in repositories, not projects: this cohort is discovered repositories that have
      // no project yet, which is what the row's description says too.
      badge: (
        <Badge variety={BadgeVariety.Neutral}>
          {formatMessage(
            { id: 'onboarding_dashboard.journey.analyze.repositories_count' },
            { count: analyze.notImported },
          )}
        </Badge>
      ),
      cta: (
        <ImportRepositoriesCta>
          {formatMessage({ id: 'onboarding_dashboard.journey.analyze.not_imported.cta' })}
        </ImportRepositoriesCta>
      ),
      description: formatMessage({ id: 'onboarding_dashboard.journey.analyze.not_imported.desc' }),
      icon: <IconDot color="echoes-color-icon-disabled" isFilled />,
      key: 'not-imported',
      titleId: 'onboarding_dashboard.journey.analyze.not_imported.title',
    },
  ];

  return (
    <div className="sw-flex sw-items-start sw-gap-8">
      <PanelDonut
        centerLabel={formatMessage(
          { id: 'onboarding_dashboard.percent' },
          { percent: analyzedPct },
        )}
        centerSubLabel={formatMessage({
          id: 'onboarding_dashboard.journey.analyze.analyzed_label',
        })}
        segments={segments}
      />

      <div className="sw-flex sw-min-w-0 sw-flex-1 sw-flex-col sw-gap-4 sw-py-4">
        <div className="sw-flex sw-flex-col sw-gap-2">
          <Heading as="h3" size={HeadingSize.Medium}>
            {formatMessage({ id: 'onboarding_dashboard.journey.analyze.title' })}
          </Heading>

          <Text as="p" isSubtle>
            {formatMessage({ id: 'onboarding_dashboard.journey.analyze.description' })}
          </Text>
        </div>

        <div className="sw-flex sw-flex-col sw-gap-3">
          {rows.map((row) => (
            <Card key={row.key}>
              <Card.Body>
                <div className="sw-flex sw-items-center sw-justify-between sw-gap-4">
                  <div className="sw-flex sw-min-w-0 sw-max-w-[540px] sw-items-start sw-gap-2">
                    <span className="sw-flex sw-shrink-0">{row.icon}</span>
                    <div className="sw-flex sw-min-w-0 sw-flex-col sw-gap-1">
                      <span className="sw-flex sw-items-center sw-gap-2">
                        <Text isHighlighted>{formatMessage({ id: row.titleId })}</Text>
                        {row.badge}
                      </span>
                      <Text isSubtle size={TextSize.Small}>
                        {row.description}
                      </Text>
                    </div>
                  </div>

                  {row.cta}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
