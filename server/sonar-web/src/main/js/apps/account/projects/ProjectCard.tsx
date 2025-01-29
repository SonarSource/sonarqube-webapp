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
  Card,
  DiscreetLink,
  LightPrimary,
  Note,
  QualityGateIndicator,
  SubHeading,
  UnorderedList,
} from '~design-system';
import MetaLink from '~sq-server-shared/components/common/MetaLink';
import Tooltip from '~sq-server-shared/components/controls/Tooltip';
import DateFromNow from '~sq-server-shared/components/intl/DateFromNow';
import { translate, translateWithParameters } from '~sq-server-shared/helpers/l10n';
import { orderLinks } from '~sq-server-shared/helpers/projectLinks';
import { getProjectUrl } from '~sq-server-shared/helpers/urls';
import { formatMeasure } from '~sq-server-shared/sonar-aligned/helpers/measures';
import { Status } from '~sq-server-shared/sonar-aligned/types/common';
import { MetricType } from '~sq-server-shared/sonar-aligned/types/metrics';
import { MyProject, ProjectLink } from '~sq-server-shared/types/types';

interface Props {
  project: MyProject;
}

export default function ProjectCard({ project }: Readonly<Props>) {
  const { links } = project;

  const orderedLinks: ProjectLink[] = orderLinks(
    links.map((link, i) => {
      const { href, name, type } = link;
      return {
        id: `link-${i}`,
        name,
        type,
        url: href,
      };
    }),
  );

  const { lastAnalysisDate } = project;

  const formatted = formatMeasure(project.qualityGate, MetricType.Level);
  const qualityGateLabel = translateWithParameters('overview.quality_gate_x', formatted);

  return (
    <Card>
      <aside className="sw-float-right sw-flex sw-flex-col sw-items-end sw-gap-2">
        {lastAnalysisDate !== undefined ? (
          <Note>
            <DateFromNow date={lastAnalysisDate}>
              {(fromNow) => translateWithParameters('my_account.projects.analyzed_x', fromNow)}
            </DateFromNow>
          </Note>
        ) : (
          <Note>{translate('my_account.projects.never_analyzed')}</Note>
        )}

        {project.qualityGate !== undefined && (
          <div>
            <Tooltip content={qualityGateLabel}>
              <span className="sw-flex sw-items-center">
                <QualityGateIndicator status={(project.qualityGate as Status) ?? 'NONE'} />
                <LightPrimary className="sw-ml-2 sw-typo-semibold">{formatted}</LightPrimary>
              </span>
            </Tooltip>
          </div>
        )}
      </aside>

      <SubHeading as="h3">
        <DiscreetLink to={getProjectUrl(project.key)}>{project.name}</DiscreetLink>
      </SubHeading>

      <Note>{project.key}</Note>

      {!!project.description && <div className="sw-mt-2">{project.description}</div>}

      {orderedLinks.length > 0 && (
        <div className="sw-mt-2">
          <UnorderedList className="sw-flex sw-gap-4">
            {orderedLinks.map((link) => (
              <MetaLink key={link.id} link={link} />
            ))}
          </UnorderedList>
        </div>
      )}
    </Card>
  );
}
