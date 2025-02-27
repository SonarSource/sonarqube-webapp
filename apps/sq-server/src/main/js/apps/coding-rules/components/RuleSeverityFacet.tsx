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

import SeverityFacet from '~sq-server-shared/components/facets/SeverityFacet';
import StandardSeverityFacet from '~sq-server-shared/components/facets/StandardSeverityFacet';
import { useStandardExperienceModeQuery } from '~sq-server-shared/queries/mode';
import { CodingRulesQuery } from '~sq-server-shared/types/coding-rules';
import { FacetKey, Facets } from '~sq-server-shared/utils/coding-rules-query';

interface RuleStandardSeverityFacet {
  facets?: Facets;
  onChange: (changes: Partial<CodingRulesQuery>) => void;
  onToggle: (facet: FacetKey) => void;
  openFacets?: Facets;
  query: CodingRulesQuery;
}

export default function RuleSeverityFacet(props: Readonly<RuleStandardSeverityFacet>) {
  const { query, facets, ...rest } = props;
  const { data: isStandardMode } = useStandardExperienceModeQuery();
  const hasActiveProfileFilter = Boolean(query.activation && query.profile);
  let property: FacetKey = isStandardMode ? 'severities' : 'impactSeverities';
  property = hasActiveProfileFilter ? `active_${property}` : property;

  const severityProps = {
    ...rest,
    open: Boolean(props.openFacets?.[property]),
    values: query[property],
    stats: facets?.[property],
    property,
  };

  return isStandardMode ? (
    <StandardSeverityFacet {...severityProps} />
  ) : (
    <SeverityFacet {...severityProps} />
  );
}
