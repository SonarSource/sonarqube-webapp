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

import {
  Badge,
  BadgeVariety,
  IconSeverityBlocker,
  Link,
  LinkHighlight,
  Spinner,
  Text,
  TextSize,
} from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { useCurrentBranchQuery } from '~adapters/queries/branch';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { MeasureEnhanced } from '~shared/types/measures';
import { MetricKey } from '~shared/types/metrics';
import { getLeakValue } from '~sq-server-commons/components/measure/utils';
import { useComponent } from '~sq-server-commons/context/componentContext/withComponentContext';
import { SOFTWARE_QUALITIES } from '~sq-server-commons/helpers/constants';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useDocUrl } from '~sq-server-commons/helpers/docs';
import { findMeasure } from '~sq-server-commons/helpers/measures';
import { useIssuesSearchQuery } from '~sq-server-commons/queries/issues';
import { IssueStatus } from '~sq-server-commons/types/issues';
import { IssuesSandboxQualityMeasure } from './IssuesSandboxQualityMeasure';
import useSandboxFacetsNamesBasedOnMode from './useFacetsNamesBasedOnMode';

export interface IssuesInSandboxSectionProps {
  inNewCodePeriod?: boolean;
  measures: MeasureEnhanced[];
}

export function IssuesInSandboxSection({
  measures,
  inNewCodePeriod = false,
}: Readonly<IssuesInSandboxSectionProps>) {
  const docUrl = useDocUrl(DocLink.IssuesFromSonarQubeUpdate);
  const { component } = useComponent();
  const { data: branchLike } = useCurrentBranchQuery(component);
  const { severityFacet, typeFacet, severityFilter } = useSandboxFacetsNamesBasedOnMode();

  const sandboxMeasure = findMeasure(
    measures,
    inNewCodePeriod ? MetricKey.new_issues_in_sandbox : MetricKey.issues_in_sandbox,
  );
  const measureValue = inNewCodePeriod ? getLeakValue(sandboxMeasure) : sandboxMeasure?.value;
  const hasSandboxedIssues = Boolean(measureValue && Number(measureValue) > 0);

  const commonIssueSearchParams = {
    ...getBranchLikeQuery(branchLike),
    components: component?.key,
    inNewCodePeriod,
    facets: [severityFacet, typeFacet].join(','),
    issueStatuses: IssueStatus.InSandbox,
    ps: 1,
  };

  const { data: sandboxIssues, isLoading: loadingSandboxedIssues } = useIssuesSearchQuery(
    commonIssueSearchParams,
    {
      enabled: hasSandboxedIssues && !component?.needIssueSync,
      select: (data) => {
        const typeFacetData = data.facets.find((facet) => facet.property === typeFacet);
        const severityFacetData = data.facets.find((facet) => facet.property === severityFacet);

        return {
          issuesByType: Object.fromEntries(
            typeFacetData?.values.map(({ val, count }) => [val, count]) ?? [],
          ),
          hasBlockerIssues: Boolean(
            severityFacetData?.values.find(({ val, count }) => val === severityFilter && count > 0),
          ),
        };
      },
    },
  );

  const { data: blockerIssuesByType, isLoading: loadingSandboxedBlockerIssues } =
    useIssuesSearchQuery(
      {
        ...commonIssueSearchParams,
        [severityFacet]: severityFilter,
      },
      {
        enabled: Boolean(sandboxIssues?.hasBlockerIssues),
        select: (data) => {
          const typeFacetData = data.facets.find((facet) => facet.property === typeFacet);
          return Object.fromEntries(
            typeFacetData?.values.map(({ val, count }) => [val, count]) ?? [],
          );
        },
      },
    );

  if (!hasSandboxedIssues || component?.needIssueSync) {
    return null;
  }

  return (
    <section className="sw-col-span-3">
      <Text isHighlighted>
        <FormattedMessage id={`metric.${MetricKey.issues_in_sandbox}.short_name`} />
        <Spinner isLoading={loadingSandboxedBlockerIssues} wrapperClassName="sw-inline-flex">
          {sandboxIssues?.hasBlockerIssues && (
            <Badge IconLeft={IconSeverityBlocker} className="sw-ml-2" variety={BadgeVariety.Danger}>
              <FormattedMessage id="issue.sandbox.includes_blockers" />
            </Badge>
          )}
        </Spinner>
      </Text>
      <Spinner isLoading={loadingSandboxedIssues}>
        <div className="sw-my-4 sw-flex sw-justify-between sw-max-w-[466px]">
          {sandboxIssues &&
            SOFTWARE_QUALITIES.map((quality) => (
              <IssuesSandboxQualityMeasure
                blockerIssuesByType={blockerIssuesByType}
                inNewCodePeriod={inNewCodePeriod}
                issuesByType={sandboxIssues?.issuesByType}
                key={quality}
                quality={quality}
              />
            ))}
        </div>
      </Spinner>
      <Text as="p" className="sw-w-[364px]" isSubtle size={TextSize.Small}>
        <FormattedMessage id={`metric.${MetricKey.issues_in_sandbox}.description`} />
      </Text>
      <Text as="p" isSubtle size={TextSize.Small}>
        <Link enableOpenInNewTab highlight={LinkHighlight.CurrentColor} to={docUrl}>
          <FormattedMessage id="learn_more_in_doc" />
        </Link>
      </Text>
    </section>
  );
}
