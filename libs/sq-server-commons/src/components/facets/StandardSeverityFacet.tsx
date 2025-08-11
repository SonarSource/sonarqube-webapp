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
import SoftwareImpactSeverityIcon from '~shared/components/icon-mappers/SoftwareImpactSeverityIcon';
import { SEVERITIES } from '../../helpers/constants';
import { translate } from '../../helpers/l10n';
import { FacetKey } from '../../utils/coding-rules-query';
import QGMetricsMismatchHelp from '../issues/sidebar/QGMetricsMismatchHelp';
import Facet, { BasicProps } from './Facet';

export default function StandardSeverityFacet(
  props: Readonly<BasicProps & { headerName?: string; property?: FacetKey }>,
) {
  const renderName = React.useCallback(
    (severity: string, disabled: boolean) => (
      <div className="sw-flex sw-items-center">
        <SoftwareImpactSeverityIcon disabled={disabled} severity={severity} />
        <span className="sw-ml-1">{translate('severity', severity)}</span>
      </div>
    ),
    [],
  );

  const renderTextName = React.useCallback(
    (severity: string) => translate('severity', severity),
    [],
  );

  return (
    <Facet
      {...props}
      help={Boolean(props.secondLine) && <QGMetricsMismatchHelp />}
      options={SEVERITIES}
      property={props.property ?? 'severities'}
      renderName={renderName}
      renderTextName={renderTextName}
    />
  );
}
