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

import { LinkHighlight } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import { DismissableMessageCallout } from '~shared/components/common/DismissableMessageCallout';
import { isPullRequest } from '~shared/helpers/branch-like';
import { LightComponent } from '~shared/types/component';
import { MetricKey } from '~shared/types/metrics';
import { DocLink } from '../../helpers/doc-links';
import { useMeasureQuery } from '../../queries/measures';
import { useStandardExperienceModeQuery } from '../../queries/mode';
import DocumentationLink from '../common/DocumentationLink';

interface AnalysisMissingInfoMessageProps {
  component: LightComponent;
}

const ALERT_KEY = 'sonarqube.dismissed_calculation_change_alert.component';

export function ComponentMissingMqrMetricsMessage({
  component,
}: Readonly<AnalysisMissingInfoMessageProps>) {
  const { key: componentKey, qualifier } = component;
  const { data: isStandardMode, isLoading } = useStandardExperienceModeQuery();
  const { data: branchLike, isLoading: loadingBranch } = useCurrentBranchQuery(component);
  const { data: standardMeasure, isLoading: loadingStandardMeasure } = useMeasureQuery(
    {
      componentKey,
      metricKey: MetricKey.security_rating,
      branchLike,
    },
    { enabled: !isLoading && !isStandardMode && !loadingBranch },
  );
  const { data: mqrMeasure, isLoading: loadingMQRMeasure } = useMeasureQuery(
    {
      componentKey,
      metricKey: isPullRequest(branchLike)
        ? MetricKey.new_software_quality_security_rating
        : MetricKey.software_quality_security_rating,
      branchLike,
    },
    {
      enabled: !isLoading && !isStandardMode && !loadingBranch && Boolean(standardMeasure),
    },
  );
  const loading = loadingMQRMeasure || loadingStandardMeasure || isLoading || loadingBranch;

  if (loading || isStandardMode || Boolean(mqrMeasure) || !standardMeasure) {
    return null;
  }

  return (
    <DismissableMessageCallout alertKey={`${ALERT_KEY}_${componentKey}`} variety="info">
      <FormattedMessage
        id="overview.missing_project_data"
        tagName="div"
        values={{
          qualifier,
          link: (text) => (
            <DocumentationLink
              className="sw-whitespace-nowrap"
              enableOpenInNewTab
              highlight={LinkHighlight.CurrentColor}
              to={DocLink.MetricDefinitions}
            >
              {text}
            </DocumentationLink>
          ),
        }}
      />
    </DismissableMessageCallout>
  );
}
