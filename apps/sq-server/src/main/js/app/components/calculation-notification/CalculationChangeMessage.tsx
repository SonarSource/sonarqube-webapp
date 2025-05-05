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

import { LinkHighlight } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { ComponentQualifier } from '~shared/types/component';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { DismissableAlert } from '~sq-server-commons/components/ui/DismissableAlert';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import { useLocation } from '~sq-server-commons/sonar-aligned/components/hoc/withRouter';

const SHOW_MESSAGE_PATHS: Record<string, ComponentQualifier> = {
  '/projects': ComponentQualifier.Project,
  '/projects/favorite': ComponentQualifier.Project,
  '/portfolios': ComponentQualifier.Portfolio,
};

const ALERT_KEY = 'sonarqube.dismissed_calculation_change_alert';

export default function CalculationChangeMessage() {
  const location = useLocation();
  const { data: isStandardMode } = useStandardExperienceModeQuery();

  if (isStandardMode || !Object.keys(SHOW_MESSAGE_PATHS).includes(location.pathname)) {
    return null;
  }

  return (
    <DismissableAlert alertKey={ALERT_KEY + SHOW_MESSAGE_PATHS[location.pathname]} variant="info">
      <FormattedMessage
        id="notification.calculation_change.message"
        values={{
          link: (text) => (
            <DocumentationLink
              className="sw-ml-1"
              highlight={LinkHighlight.Default}
              shouldOpenInNewTab
              to={DocLink.MetricDefinitions}
            >
              {text}
            </DocumentationLink>
          ),
        }}
      />
    </DismissableAlert>
  );
}
