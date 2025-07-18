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

import * as React from 'react';
import Facet, { BasicProps } from '~sq-server-commons/components/facets/Facet';
import { FacetHelp } from '~sq-server-commons/components/facets/FacetHelp';
import { SOFTWARE_QUALITIES } from '~sq-server-commons/helpers/constants';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { translate } from '~sq-server-commons/helpers/l10n';

export default function SoftwareQualityFacet(props: Readonly<BasicProps>) {
  const renderName = React.useCallback(
    (quality: string) => translate('software_quality', quality),
    [],
  );

  return (
    <Facet
      {...props}
      help={<FacetHelp link={DocLink.CleanCode} property="impactSoftwareQualities" />}
      options={SOFTWARE_QUALITIES}
      property="impactSoftwareQualities"
      renderName={renderName}
      renderTextName={renderName}
    />
  );
}
