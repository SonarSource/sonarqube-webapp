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
  IconCheckCircle,
  IconDot,
  Text,
  TextSize,
} from '@sonarsource/echoes-react';
import { ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { JourneyState } from '../../../types/types';
import { PanelDonut, PanelDonutSegment } from '../charts/PanelDonut';

interface Props {
  state: JourneyState;
}

/**
 * "Analyze your projects" detail panel. Left: a donut breaking analysed projects into their scan
 * configuration. Right: three action cards nudging the user to fix, import, or upgrade projects. The
 * cohorts are approximated from the overview (see {@link JourneyState.analyze}); CTAs are no-ops.
 */
export function AnalyzeProjectsPanel({ state }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const { analyze, analyzed, analyzedPct, totalProjects } = state;

  const segments: PanelDonutSegment[] = [
    {
      color: cssVar('color-background-success-default'),
      label: formatMessage({ id: 'onboarding_dashboard.journey.analyze.legend.full_ci' }),
      value: analyze.fullCi,
    },
    {
      color: cssVar('color-background-info-default'),
      label: formatMessage({ id: 'onboarding_dashboard.journey.analyze.legend.autoscan' }),
      value: analyze.autoscan,
    },
    {
      color: cssVar('color-background-warning-default'),
      label: formatMessage({ id: 'onboarding_dashboard.journey.analyze.legend.local' }),
      value: analyze.local,
    },
    {
      color: cssVar('color-background-danger-default'),
      label: formatMessage({ id: 'onboarding_dashboard.journey.analyze.legend.not_scanned' }),
      value: analyze.notScanned,
    },
    {
      color: cssVar('color-background-neutral-subtle-default'),
      label: formatMessage({ id: 'onboarding_dashboard.journey.analyze.legend.not_imported' }),
      value: analyze.notImported,
    },
  ];

  const projectsCount = (count: number) =>
    formatMessage({ id: 'onboarding_dashboard.journey.analyze.projects_count' }, { count });

  const rows: Array<{
    badge: ReactNode;
    ctaId: string;
    ctaVariety: ButtonVariety;
    description: string;
    icon: ReactNode;
    key: string;
    titleId: string;
  }> = [
    {
      badge: <Badge variety={BadgeVariety.Danger}>{projectsCount(analyze.notScanned)}</Badge>,
      ctaId: 'onboarding_dashboard.journey.analyze.not_scanned.cta',
      ctaVariety: ButtonVariety.Primary,
      description: formatMessage({ id: 'onboarding_dashboard.journey.analyze.not_scanned.desc' }),
      icon: <IconDot color="echoes-color-icon-danger" isFilled />,
      key: 'not-scanned',
      titleId: 'onboarding_dashboard.journey.analyze.not_scanned.title',
    },
    {
      badge: <Badge variety={BadgeVariety.Neutral}>{projectsCount(analyze.notImported)}</Badge>,
      ctaId: 'onboarding_dashboard.journey.analyze.not_imported.cta',
      ctaVariety: ButtonVariety.Default,
      description: formatMessage({ id: 'onboarding_dashboard.journey.analyze.not_imported.desc' }),
      icon: <IconDot color="echoes-color-icon-disabled" isFilled />,
      key: 'not-imported',
      titleId: 'onboarding_dashboard.journey.analyze.not_imported.title',
    },
    {
      badge: (
        <Badge variety={BadgeVariety.Highlight}>
          {formatMessage({ id: 'onboarding_dashboard.journey.import.recommended' })}
        </Badge>
      ),
      ctaId: 'onboarding_dashboard.journey.analyze.full_ci.cta',
      ctaVariety: ButtonVariety.Default,
      description: formatMessage(
        { id: 'onboarding_dashboard.journey.analyze.full_ci.desc' },
        { count: analyze.moveToFullCi },
      ),
      icon: <IconCheckCircle color="echoes-color-icon-accent" />,
      key: 'full-ci',
      titleId: 'onboarding_dashboard.journey.analyze.full_ci.title',
    },
  ];

  return (
    <div className="sw-flex sw-items-start sw-gap-8">
      <PanelDonut
        centerPercent={analyzedPct}
        centerSubLabel={formatMessage(
          { id: 'onboarding_dashboard.journey.step.count' },
          { done: analyzed, total: totalProjects },
        )}
        segments={segments}
        viewAllLabel={formatMessage({ id: 'onboarding_dashboard.journey.import.view_all' })}
      />

      <div className="sw-flex sw-min-w-0 sw-flex-1 sw-flex-col sw-gap-4">
        <Heading as="h3" size={HeadingSize.Small}>
          {formatMessage({ id: 'onboarding_dashboard.journey.analyze.title' })}
        </Heading>

        <Text as="p" isSubtle>
          {formatMessage({ id: 'onboarding_dashboard.journey.analyze.description' })}
        </Text>

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

                  <Button variety={row.ctaVariety}>{formatMessage({ id: row.ctaId })}</Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
