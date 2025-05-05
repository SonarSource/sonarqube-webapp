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

import { FormattedMessage } from 'react-intl';
import { DiscreetLink, InfoCard } from '~design-system';
import { MetricKey } from '~shared/types/metrics';
import { SonarLintLogo } from '~sq-server-commons/components/logos/SonarLintLogo';
import withCurrentUserContext from '~sq-server-commons/context/current-user/withCurrentUserContext';
import { QualityGateStatusCondition } from '~sq-server-commons/types/quality-gates';
import { CurrentUser } from '~sq-server-commons/types/users';

export interface SonarLintPromotionProps {
  currentUser: CurrentUser;
  qgConditions?: QualityGateStatusCondition[];
}

const CONDITIONS_TO_SHOW = [
  MetricKey.new_blocker_violations,
  MetricKey.new_critical_violations,
  MetricKey.new_info_violations,
  MetricKey.new_violations,
  MetricKey.new_major_violations,
  MetricKey.new_minor_violations,
  MetricKey.new_code_smells,
  MetricKey.new_bugs,
  MetricKey.new_vulnerabilities,
  MetricKey.new_security_rating,
  MetricKey.new_maintainability_rating,
  MetricKey.new_reliability_rating,
];

export function SonarLintPromotion({ currentUser, qgConditions }: SonarLintPromotionProps) {
  const showMessage = qgConditions?.some(
    (qgCondition) =>
      CONDITIONS_TO_SHOW.includes(qgCondition.metric) && qgCondition.level === 'ERROR',
  );
  if (!showMessage || currentUser.usingSonarLintConnectedMode) {
    return null;
  }
  return (
    <InfoCard className="it__overview__sonarlint-promotion sw-typo-default">
      <FormattedMessage
        id="overview.fix_failed_conditions_with_sonarlint"
        values={{
          link: (
            <>
              <DiscreetLink
                className="sw-mr-1"
                rel="noopener noreferrer"
                showExternalIcon={false}
                target="_blank"
                to="https://www.sonarsource.com/products/sonarlint/features/connected-mode/?referrer=sonarqube"
              >
                SonarQube for IDE
              </DiscreetLink>
              <span className="sw-align-middle">
                <SonarLintLogo />
              </span>
            </>
          ),
        }}
      />
    </InfoCard>
  );
}

export default withCurrentUserContext(SonarLintPromotion);
