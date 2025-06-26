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

import { SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { FacetHelp } from '~sq-server-commons/components/facets/FacetHelp';
import QGMetricsMismatchHelp from '~sq-server-commons/components/issues/sidebar/QGMetricsMismatchHelp';
import { SOFTWARE_QUALITIES } from '~sq-server-commons/helpers/constants';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { CommonProps, SimpleListStyleFacet } from './SimpleListStyleFacet';

interface Props extends CommonProps {
  qualities: Array<SoftwareQuality>;
}

export function SoftwareQualityFacet(props: Readonly<Props>) {
  const { qualities = [], ...rest } = props;

  return (
    <SimpleListStyleFacet
      help={
        props.secondLine ? (
          <QGMetricsMismatchHelp />
        ) : (
          <FacetHelp link={DocLink.CleanCode} property="impactSoftwareQualities" />
        )
      }
      itemNamePrefix="software_quality"
      listItems={SOFTWARE_QUALITIES}
      property="impactSoftwareQualities"
      selectedItems={qualities}
      {...rest}
    />
  );
}
