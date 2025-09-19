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

import styled from '@emotion/styled';
import { cssVar, Spinner, Text } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { CardSeparator } from '~design-system';
import { isApplication } from '~shared/helpers/component';
import { ComponentQualifier } from '~shared/types/component';
import { MeasureEnhanced } from '~shared/types/measures';
import IgnoredConditionWarning from '~sq-server-commons/components/overview/IgnoredConditionWarning';
import { isDiffMetric } from '~sq-server-commons/helpers/measures';
import { QualityGateStatus } from '~sq-server-commons/types/quality-gates';
import { Component, QualityGate } from '~sq-server-commons/types/types';
import QualityGatePanelSection from './QualityGatePanelSection';
import SonarLintPromotion from './SonarLintPromotion';

export interface QualityGatePanelProps {
  component: Pick<Component, 'key' | 'qualifier' | 'qualityGate'>;
  isNewCode?: boolean;
  loading?: boolean;
  measures?: MeasureEnhanced[];
  qgStatuses?: QualityGateStatus[];
  qualityGate?: QualityGate;
  totalFailedConditionLength: number;
}

export function QualityGatePanel(props: QualityGatePanelProps) {
  const {
    component,
    loading,
    measures,
    qgStatuses = [],
    qualityGate,
    isNewCode = false,
    totalFailedConditionLength,
  } = props;

  if (qgStatuses === undefined) {
    return null;
  }

  const failedQgStatuses = qgStatuses.filter((qgStatus) => qgStatus.failedConditions.length > 0);

  const isApp = isApplication(component.qualifier);

  const showIgnoredConditionWarning =
    component.qualifier === ComponentQualifier.Project &&
    qgStatuses.some((p) => Boolean(p.ignoredConditions));

  return (
    <Spinner isLoading={loading}>
      <Column data-testid="overview__quality-gate-panel-conditions">
        <Conditions>
          {showIgnoredConditionWarning && isNewCode && <IgnoredConditionWarning />}

          {isApp && (
            <>
              <Text className="sw-mb-3" colorOverride="echoes-color-text-danger">
                <FormattedMessage
                  id="quality_gates.conditions.x_conditions_failed"
                  values={{
                    conditions: totalFailedConditionLength,
                  }}
                />
              </Text>
              <CardSeparator />
            </>
          )}

          {totalFailedConditionLength > 0 && (
            <div data-test="overview__quality-gate-conditions">
              {failedQgStatuses.map((qgStatus, qgStatusIdx) => {
                const failedConditionLength = qgStatus.failedConditions.filter((con) =>
                  isNewCode ? isDiffMetric(con.metric) : !isDiffMetric(con.metric),
                ).length;
                if (failedConditionLength > 0) {
                  return (
                    <QualityGatePanelSection
                      isApplication={isApp}
                      isLastStatus={qgStatusIdx === failedQgStatuses.length - 1}
                      isNewCode={isNewCode}
                      key={qgStatus.key}
                      measures={measures}
                      qgStatus={qgStatus}
                      qualityGate={qualityGate}
                    />
                  );
                }
                return null;
              })}
            </div>
          )}
        </Conditions>

        <SonarLintPromotion qgConditions={qgStatuses?.flatMap((qg) => qg.failedConditions)} />
      </Column>
    </Spinner>
  );
}

export default React.memo(QualityGatePanel);

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${cssVar('dimension-space-400')};
`;

const Conditions = styled.div`
  &:empty {
    display: contents;
  }
`;
