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

import { Link, Text } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { Card, QualityGateIndicator, SubHeading } from '~design-system';
import DateFromNow from '~shared/components/intl/DateFromNow';
import { getProjectOverviewUrl } from '~shared/helpers/urls';
import { QGStatus } from '~shared/types/common';
import { MetricType } from '~shared/types/metrics';
import MetaLink from '~sq-server-commons/components/common/MetaLink';
import Tooltip from '~sq-server-commons/components/controls/Tooltip';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { orderLinks } from '~sq-server-commons/helpers/projectLinks';
import { formatMeasure } from '~sq-server-commons/sonar-aligned/helpers/measures';
import { MyProject, ProjectLink } from '~sq-server-commons/types/types';

interface Props {
  project: MyProject;
}

export default function ProjectCard({ project }: Readonly<Props>) {
  const { links } = project;
  const intl = useIntl();

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
  const qualityGateLabel = intl.formatMessage(
    { id: 'overview.quality_gate_x' },
    { status: formatted },
  );

  return (
    <Card>
      <aside className="sw-float-right sw-flex sw-flex-col sw-items-end sw-gap-2">
        {lastAnalysisDate !== undefined ? (
          <Text isSubtle>
            <DateFromNow date={lastAnalysisDate}>
              {(fromNow) => translateWithParameters('my_account.projects.analyzed_x', fromNow)}
            </DateFromNow>
          </Text>
        ) : (
          <Text isSubtle>{translate('my_account.projects.never_analyzed')}</Text>
        )}

        {project.qualityGate !== undefined && (
          <div>
            <Tooltip content={qualityGateLabel}>
              <span className="sw-flex sw-items-center">
                <QualityGateIndicator status={(project.qualityGate as QGStatus) ?? 'NONE'} />
                <Text className="sw-ml-2" isHighlighted>
                  {formatted}
                </Text>
              </span>
            </Tooltip>
          </div>
        )}
      </aside>

      <SubHeading as="h3">
        <Link highlight="subtle" to={getProjectOverviewUrl(project.key)}>
          {project.name}
        </Link>
      </SubHeading>

      <Text isSubtle>{project.key}</Text>

      {!!project.description && <div className="sw-mt-2">{project.description}</div>}

      {orderedLinks.length > 0 && (
        <ul className="sw-list-none sw-flex sw-flex-row sw-gap-4 sw-mt-2">
          {orderedLinks.map((link) => (
            <MetaLink key={link.id} link={link} />
          ))}
        </ul>
      )}
    </Card>
  );
}
