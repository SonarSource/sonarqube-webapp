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

import * as React from 'react';
import { BorderlessAccordion, CardSeparator } from '~design-system';
import FailedConditions from '~sq-server-commons/components/overview/FailedConditions';
import { translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { QualityGateStatus } from '~sq-server-commons/types/quality-gates';
import { QualityGate } from '~sq-server-commons/types/types';

export interface QualityGatePanelSectionProps {
  isApplication?: boolean;
  isLastStatus?: boolean;
  isNewCode: boolean;
  qgStatus: QualityGateStatus;
  qualityGate?: QualityGate;
}

export function QualityGatePanelSection(props: QualityGatePanelSectionProps) {
  const { isApplication, isLastStatus, qgStatus, qualityGate, isNewCode } = props;
  const [collapsed, setCollapsed] = React.useState(false);

  const toggle = React.useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed]);

  const toggleLabel = collapsed
    ? translateWithParameters('overview.quality_gate.show_project_conditions_x', qgStatus.name)
    : translateWithParameters('overview.quality_gate.hide_project_conditions_x', qgStatus.name);

  return (
    <>
      {isApplication ? (
        <>
          <BorderlessAccordion
            ariaLabel={toggleLabel}
            header={
              <div className="sw-flex sw-flex-col sw-text-sm">
                <span className="sw-typo-semibold">{qgStatus.name}</span>
              </div>
            }
            onClick={toggle}
            open={!collapsed}
          >
            <CardSeparator />

            <FailedConditions
              branchLike={qgStatus.branchLike}
              component={qgStatus}
              failedConditions={qgStatus.failedConditions}
              isApplication={isApplication}
              isNewCode={isNewCode}
              qualityGate={qualityGate}
            />
          </BorderlessAccordion>

          {(!isLastStatus || collapsed) && <CardSeparator />}
        </>
      ) : (
        <FailedConditions
          branchLike={qgStatus.branchLike}
          component={qgStatus}
          failedConditions={qgStatus.failedConditions}
          isApplication={isApplication}
          isNewCode={isNewCode}
          qualityGate={qualityGate}
        />
      )}
    </>
  );
}

export default React.memo(QualityGatePanelSection);
