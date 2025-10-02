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

import { Heading, Link, LinkHighlight, Text } from '@sonarsource/echoes-react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import { TopLevelNewCodeDefinitionPage } from '~shared/components/new-code/TopLevelNewCodeDefinitionPage';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useDocUrl } from '~sq-server-commons/helpers/docs';

export default function NewCodeDefinition() {
  const intl = useIntl();
  const docUrl = useDocUrl();

  return (
    <>
      <Helmet defer={false} title={intl.formatMessage({ id: 'new_code_definition.page.title' })} />

      {/* Main Content Card */}
      <div className="sw-max-w-abs-800">
        <div className="sw-mb-8">
          <Heading as="h1" className="sw-mb-4">
            <FormattedMessage id="new_code_definition.page.title" />
          </Heading>
          <Text>
            <FormattedMessage
              id="new_code.page.description"
              values={{
                br: () => <br />,
                url: (
                  <Link
                    enableOpenInNewTab
                    highlight={LinkHighlight.CurrentColor}
                    to={docUrl(DocLink.NewCodeDefinition)}
                  >
                    <FormattedMessage id="new_code.page.description.documentation_link" />
                  </Link>
                ),
              }}
            />
          </Text>
        </div>
        <TopLevelNewCodeDefinitionPage />
      </div>
    </>
  );
}
