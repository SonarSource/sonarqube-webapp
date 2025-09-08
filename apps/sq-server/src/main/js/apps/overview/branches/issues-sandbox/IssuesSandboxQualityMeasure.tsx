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

import { LinkHighlight, LinkStandalone, Text, TextSize } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { SOFTWARE_QUALITY_LABELS } from '~shared/helpers/l10n';
import { getComponentIssuesUrl } from '~shared/helpers/urls';
import { SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { MetricType } from '~shared/types/metrics';
import { useComponent } from '~sq-server-commons/context/componentContext/withComponentContext';
import { getIssueTypeBySoftwareQuality } from '~sq-server-commons/helpers/issues';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import { formatMeasure } from '~sq-server-commons/sonar-aligned/helpers/measures';
import { IssueStatus } from '~sq-server-commons/types/issues';
import useSandboxFacetsNamesBasedOnMode from './useFacetsNamesBasedOnMode';

export interface IssuesSandboxQualityMeasureProps {
  blockerIssuesByType?: Record<string, number>;
  inNewCodePeriod?: boolean;
  issuesByType: Record<string, number>;
  quality: SoftwareQuality;
}

export function IssuesSandboxQualityMeasure({
  blockerIssuesByType = {},
  issuesByType,
  quality,
  inNewCodePeriod = false,
}: Readonly<IssuesSandboxQualityMeasureProps>) {
  const intl = useIntl();
  const { data: isStandardExperience } = useStandardExperienceModeQuery();
  const { component } = useComponent();
  const { data: branchLike } = useCurrentBranchQuery(component);
  const { typeFacet } = useSandboxFacetsNamesBasedOnMode();

  const qualityIssues = formatMeasure(
    getIssueCount(quality, issuesByType, isStandardExperience),
    MetricType.ShortInteger,
  );
  const hasBlockers = Number(getIssueCount(quality, blockerIssuesByType, isStandardExperience)) > 0;

  const link = getComponentIssuesUrl(component?.key ?? '', {
    ...getBranchLikeQuery(branchLike),
    [typeFacet]: isStandardExperience ? getIssueTypeBySoftwareQuality(quality) : quality,
    inNewCodePeriod,
    issueStatuses: IssueStatus.InSandbox,
  });

  const issueIntlId = isStandardExperience
    ? `issue.type.${getIssueTypeBySoftwareQuality(quality)}.plural`
    : SOFTWARE_QUALITY_LABELS[quality];

  return (
    <div>
      <Text colorOverride={hasBlockers ? 'echoes-color-text-danger' : 'echoes-color-text-default'}>
        <LinkStandalone
          aria-label={intl.formatMessage(
            {
              id: `issue.sandbox.see_x_sandboxed_issues`,
            },
            {
              count: qualityIssues,
              quality: intl.formatMessage({ id: issueIntlId }),
              hasBlockers,
            },
          )}
          className="sw-text-lg sw-font-semibold"
          highlight={LinkHighlight.CurrentColor}
          to={link}
        >
          {qualityIssues}
        </LinkStandalone>
      </Text>
      <Text
        className="sw-ml-1"
        colorOverride={hasBlockers ? 'echoes-color-text-danger' : 'echoes-color-text-subtle'}
        size={TextSize.Small}
      >
        <FormattedMessage id={issueIntlId} />
      </Text>
    </div>
  );
}

const getIssueCount = (
  quality: SoftwareQuality,
  issuesByType: Record<string, number> = {},
  isStandardExperience = false,
) => {
  const key = isStandardExperience ? getIssueTypeBySoftwareQuality(quality) : quality;
  return issuesByType[key] ?? 0;
};
