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
import { FormattedMessage, useIntl } from 'react-intl';
import DocumentationLink from '~sq-server-shared/components/common/DocumentationLink';
import { useAppState } from '~sq-server-shared/context/app-state/withAppStateContext';
import { Banner } from '~sq-server-shared/design-system/components';
import { DocLink } from '~sq-server-shared/helpers/doc-links';
import { getInstance } from '~sq-server-shared/helpers/system';

export default function NonProductionDatabaseWarning() {
  const { productionDatabase } = useAppState();
  const { formatMessage } = useIntl();

  if (productionDatabase) {
    return null;
  }

  return (
    <Banner variant="warning">
      <div>
        <FormattedMessage
          id="notification.non_production_database.warning"
          values={{
            instance: getInstance(),
            link: (
              <DocumentationLink
                className="sw-ml-1"
                highlight={LinkHighlight.Default}
                shouldOpenInNewTab
                to={DocLink.DatabaseRequirements}
              >
                {formatMessage({ id: 'notification.non_production_database.learn_more' })}
              </DocumentationLink>
            ),
          }}
        />
      </div>
    </Banner>
  );
}
