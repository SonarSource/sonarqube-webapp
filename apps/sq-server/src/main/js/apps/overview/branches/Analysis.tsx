/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { sortBy } from 'lodash';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { QualityGateIndicator } from '~design-system';
import { QGStatus } from '~shared/types/common';
import { ComponentQualifier } from '~shared/types/component';
import DateTimeFormatter from '~sq-server-shared/components/intl/DateTimeFormatter';
import {
  AnalysisMeasuresVariations,
  ProjectAnalysisEventCategory,
  Analysis as TypeAnalysis,
} from '~sq-server-shared/types/project-activity';
import { AnalysisVariations } from './AnalysisVariations';
import Event from './Event';

export interface AnalysisProps {
  analysis: TypeAnalysis;
  isFirstAnalysis?: boolean;
  qualifier: string;
  qualityGateStatus?: string;
  variations?: AnalysisMeasuresVariations;
}

export function Analysis(props: Readonly<AnalysisProps>) {
  const { analysis, isFirstAnalysis, qualifier, qualityGateStatus, variations } = props;

  const sortedEvents = sortBy(
    analysis.events.filter((event) => {
      switch (event.category) {
        case ProjectAnalysisEventCategory.QualityGate:
          return false;
        case ProjectAnalysisEventCategory.SqUpgrade:
          return !isFirstAnalysis;
        default:
          return true;
      }
    }),
    (event) => {
      switch (event.category) {
        case ProjectAnalysisEventCategory.Version:
          // versions first
          return 0;
        case ProjectAnalysisEventCategory.SqUpgrade:
          // SQ Upgrade second
          return 1;
        default:
          // then the rest sorted by category
          return 2;
      }
    },
    'category',
    'name',
  );

  return (
    <div className="sw-typo-default" data-analysis-key={analysis.key}>
      <div className="sw-flex sw-justify-between sw-mb-1">
        <div className="sw-typo-semibold">
          <DateTimeFormatter date={analysis.date} />
        </div>
        {qualityGateStatus !== undefined && (
          <div className="sw-flex sw-items-center">
            <FormattedMessage
              id="overview.quality_gate_x"
              values={{
                status: (
                  <QualityGateIndicator
                    className="sw-mx-2"
                    size="sm"
                    status={qualityGateStatus as QGStatus}
                  />
                ),
              }}
            />
            <span className="sw-typo-semibold">
              <FormattedMessage id={`metric.level.${qualityGateStatus}`} />
            </span>
          </div>
        )}
      </div>

      {sortedEvents.map((event) => (
        <Event event={event} key={event.key} />
      ))}

      {qualifier === ComponentQualifier.Project && variations !== undefined && (
        <AnalysisVariations isFirstAnalysis={isFirstAnalysis} variations={variations} />
      )}
    </div>
  );
}

export default React.memo(Analysis);
