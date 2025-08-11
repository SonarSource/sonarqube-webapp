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
import { FormattedMessage, useIntl } from 'react-intl';
import SoftwareImpactSeverityIcon from '~shared/components/icon-mappers/SoftwareImpactSeverityIcon';
import { IMPACT_SEVERITIES } from '../../helpers/constants';
import { DocLink } from '../../helpers/doc-links';
import { translate } from '../../helpers/l10n';
import { FacetKey } from '../../utils/coding-rules-query';
import QGMetricsMismatchHelp from '../issues/sidebar/QGMetricsMismatchHelp';
import Facet, { BasicProps } from './Facet';
import { FacetHelp } from './FacetHelp';

export default function SeverityFacet(props: Readonly<BasicProps & { property?: FacetKey }>) {
  const intl = useIntl();
  const renderName = React.useCallback(
    (severity: string, disabled: boolean) => (
      <div className="sw-flex sw-items-center">
        <SoftwareImpactSeverityIcon disabled={disabled} severity={severity} />
        <span className="sw-ml-1">{translate('severity_impact', severity)}</span>
      </div>
    ),
    [],
  );

  const renderTextName = React.useCallback(
    (severity: string) => translate('severity_impact', severity),
    [],
  );

  return (
    <Facet
      {...props}
      help={
        props.secondLine ? (
          <QGMetricsMismatchHelp />
        ) : (
          <FacetHelp
            description={
              <FormattedMessage
                id="severity_impact.help.description"
                values={{
                  p1: (text) => <p>{text}</p>,
                  p: (text) => <p className="sw-mt-4">{text}</p>,
                }}
              />
            }
            link={DocLink.MQRSeverity}
            linkText={intl.formatMessage({ id: 'severity_impact.help.link' })}
            title={intl.formatMessage({ id: 'severity_impact.levels' })}
          />
        )
      }
      options={IMPACT_SEVERITIES}
      property={props.property ?? 'impactSeverities'}
      renderName={renderName}
      renderTextName={renderTextName}
    />
  );
}
