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

import { useIntl } from 'react-intl';
import { FacetHelp } from '~sq-server-commons/components/facets/FacetHelp';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { IssuesQuery } from '~sq-server-commons/types/issues';
import { BooleanFacet, BooleanFacetOption } from './BooleanFacet';

export interface DetectionCauseFacetProps {
  fetching: boolean;
  onChange: (changes: Partial<IssuesQuery>) => void;
  onToggle: (property: string) => void;
  open: boolean;
  stats: Record<string, number> | undefined;
  value: boolean | undefined;
}

export function DetectionCauseFacet(props: Readonly<DetectionCauseFacetProps>) {
  const { fetching, onChange, onToggle, open, value, stats } = props;
  const intl = useIntl();

  const property = 'fromSonarQubeUpdate';

  const options: BooleanFacetOption[] = [
    {
      nameKey: 'issues.facet.detection_cause.sonarqube_update',
      value: true,
    },
    {
      nameKey: 'issues.facet.detection_cause.other_causes',
      value: false,
    },
  ];

  return (
    <BooleanFacet
      fetching={fetching}
      help={
        <FacetHelp
          description={intl.formatMessage({ id: 'issues.facet.detection_cause.help' })}
          link={DocLink.Root}
          linkText={intl.formatMessage({ id: 'learn_more_in_doc' })}
          title={intl.formatMessage({ id: 'issues.facet.detection_cause' })}
        />
      }
      name={intl.formatMessage({ id: 'issues.facet.detection_cause' })}
      onChange={onChange}
      onToggle={onToggle}
      open={open}
      options={options}
      property={property}
      stats={stats}
      value={value}
    />
  );
}
