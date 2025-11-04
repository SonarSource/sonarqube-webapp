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

import { Heading, Link, LinkHighlight, Text } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useDocUrl } from '~sq-server-commons/helpers/docs';

export interface AppHeaderProps {
  canAdmin: boolean;
}

export default function AppHeader(props: AppHeaderProps) {
  const { canAdmin } = props;
  const toUrl = useDocUrl(DocLink.NewCodeDefinition);

  return (
    <header className="sw-mt-8 sw-mb-4">
      <Heading as="h1" className="sw-mb-6">
        <FormattedMessage id="project_baseline.page" />
      </Heading>
      <Text as="p">
        <FormattedMessage id="project_baseline.page.description" />
      </Text>
      <Text as="p" className="sw-mt-4">
        <FormattedMessage id="project_baseline.page.description2" />
        {canAdmin && (
          <FormattedMessage
            id="project_baseline.page.description3"
            values={{
              link: (text) => (
                <Link
                  highlight={LinkHighlight.CurrentColor}
                  to="/admin/settings?category=new_code_period"
                >
                  {text}
                </Link>
              ),
            }}
          />
        )}
      </Text>
      <Link
        className="sw-block"
        enableOpenInNewTab
        highlight={LinkHighlight.CurrentColor}
        to={toUrl}
      >
        <FormattedMessage id="learn_more_in_doc" />
      </Link>
    </header>
  );
}
