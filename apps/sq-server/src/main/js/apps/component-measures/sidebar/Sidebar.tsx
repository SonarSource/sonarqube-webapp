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

import { Layout } from '@sonarsource/echoes-react';
import * as React from 'react';
import { SubnavigationGroup, SubnavigationItem } from '~design-system';
import A11ySkipTarget from '~shared/components/a11y/A11ySkipTarget';
import { MeasureEnhanced } from '~shared/types/measures';
import { translate } from '~sq-server-commons/helpers/l10n';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import { Domain } from '~sq-server-commons/types/measures';
import { PROJECT_OVERVIEW, Query, isProjectOverview, populateDomainsFromMeasures } from '../utils';
import DomainSubnavigation from './DomainSubnavigation';

interface Props {
  componentKey: string;
  measures: MeasureEnhanced[];
  selectedMetric: string;
  showFullMeasures: boolean;
  updateQuery: (query: Partial<Query>) => void;
}

export default function Sidebar(props: Readonly<Props>) {
  const { showFullMeasures, updateQuery, componentKey, selectedMetric, measures } = props;
  const { data: isStandardMode } = useStandardExperienceModeQuery();
  const domains = populateDomainsFromMeasures(measures, isStandardMode);

  const handleChangeMetric = React.useCallback(
    (metric: string) => {
      updateQuery({ metric });
    },
    [updateQuery],
  );

  const handleProjectOverviewClick = () => {
    handleChangeMetric(PROJECT_OVERVIEW);
  };

  return (
    <Layout.AsideLeft size="medium">
      <section
        aria-label={translate('component_measures.navigation')}
        className="sw-flex sw-flex-col sw-gap-4"
      >
        <A11ySkipTarget
          anchor="measures_filters"
          label={translate('component_measures.skip_to_navigation')}
          weight={10}
        />
        <SubnavigationGroup>
          <SubnavigationItem
            active={isProjectOverview(selectedMetric)}
            ariaCurrent={isProjectOverview(selectedMetric)}
            onClick={handleProjectOverviewClick}
          >
            {translate('component_measures.overview', PROJECT_OVERVIEW, 'subnavigation')}
          </SubnavigationItem>
        </SubnavigationGroup>

        {domains.map((domain: Domain) => (
          <DomainSubnavigation
            componentKey={componentKey}
            domain={domain}
            key={domain.name}
            measures={measures}
            onChange={handleChangeMetric}
            open={isDomainSelected(selectedMetric, domain)}
            selected={selectedMetric}
            showFullMeasures={showFullMeasures}
          />
        ))}
      </section>
    </Layout.AsideLeft>
  );
}

function isDomainSelected(selectedMetric: string, domain: Domain) {
  return (
    selectedMetric === domain.name ||
    domain.measures.some((measure) => measure.metric.key === selectedMetric)
  );
}
