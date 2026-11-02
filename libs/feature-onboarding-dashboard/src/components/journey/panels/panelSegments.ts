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

import { cssVar } from '@sonarsource/echoes-react';
import { IntlShape } from 'react-intl';
import { IS_AUTOMATIC_ANALYSIS_SUPPORTED } from '~adapters/helpers/onboarding-actions';
import { JourneyState } from '~shared/types/onboarding';
import { PanelDonutSegment } from '../charts/PanelDonut';

type FormatMessage = IntlShape['formatMessage'];

interface SegmentOptions {
  /** Leave the "not imported" segment out, where its count is unknown rather than 0. */
  omitNotImported?: boolean;
}

function clampToRemaining(value: number, remaining: number) {
  return Math.max(Math.min(value, remaining), 0);
}

/** Imported vs not-yet-imported repositories segments. */
export function getImportSegments(
  { imported, notYetImported }: Pick<JourneyState, 'imported' | 'notYetImported'>,
  formatMessage: FormatMessage,
  { omitNotImported = false }: SegmentOptions = {},
): PanelDonutSegment[] {
  return [
    ...(imported > 0
      ? [
          {
            color: cssVar('color-charts-categorical-1'),
            label: formatMessage({ id: 'onboarding_dashboard.journey.import.legend.imported' }),
            value: imported,
          },
        ]
      : []),
    ...(omitNotImported
      ? []
      : [
          {
            color:
              imported === 0
                ? cssVar('color-charts-categorical-2')
                : cssVar('color-background-neutral-subtle-default'),
            label: formatMessage({ id: 'onboarding_dashboard.journey.import.legend.not_imported' }),
            value: notYetImported,
          },
        ]),
  ];
}

/**
 * Projects broken into analyzed, not scanned and not-yet-imported (the analyzed segment is omitted
 * when nothing has been analyzed yet). "Analyzed" is the scan-status dimension, so it spans every
 * analysis mode the product supports — CI, locally run scanners, and automatic analysis on SQ-Cloud.
 *
 * On SQ-Cloud, when the backend reports the split, the analyzed segment is broken down by analysis
 * mode (CI scan, Autoscan, and the remainder as "Other analysis" for local scanners without CI).
 */
export function getAnalyzeSegments(
  {
    analyze,
    analyzed,
    totalProjects,
  }: Pick<JourneyState, 'analyze' | 'analyzed' | 'totalProjects'>,
  formatMessage: FormatMessage,
  { omitNotImported = false }: SegmentOptions = {},
): PanelDonutSegment[] {
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

  return [
    ...analyzedSegments.filter((segment) => segment.value > 0),
    {
      color: cssVar('color-charts-categorical-2'),
      label: formatMessage({ id: 'onboarding_dashboard.journey.analyze.legend.not_scanned' }),
      value: analyze.notScanned,
    },
    ...(omitNotImported
      ? []
      : [
          {
            color: cssVar('color-background-neutral-subtle-default'),
            label: formatMessage({
              id: 'onboarding_dashboard.journey.analyze.legend.not_imported',
            }),
            value: analyze.notImported,
          },
        ]),
  ];
}
