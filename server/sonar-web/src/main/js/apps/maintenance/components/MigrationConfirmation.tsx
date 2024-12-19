/*
 * SonarQube
 * Copyright (C) 2009-2024 SonarSource SA
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

import { Button, ButtonVariety, Heading, LinkHighlight, Text } from '@sonarsource/echoes-react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import DocumentationLink from '../../../components/common/DocumentationLink';
import { DocLink } from '../../../helpers/doc-links';
import { translate } from '../../../helpers/l10n';

interface Props {
  handleMigrateClick: () => void;
}

export function MigrationConfirmation({ handleMigrateClick }: Readonly<Props>) {
  const [isDatabaseBackedUp, setIsDatabaseBackedUp] = useState(false);

  if (!isDatabaseBackedUp) {
    return (
      <div className="sw-flex sw-flex-col sw-items-center">
        <Heading as="h1" hasMarginBottom>
          {translate('maintenance.back_up_database')}
        </Heading>

        <div>
          <Text as="p" className="sw-mb-3">
            {translate('maintenance.back_up_database.1')}
          </Text>

          <Text as="p">{translate('maintenance.back_up_database.2')}</Text>
        </div>

        <Button
          className="sw-mt-6"
          onClick={() => setIsDatabaseBackedUp(true)}
          variety={ButtonVariety.Default}
        >
          {translate('continue')}
        </Button>
      </div>
    );
  }
  return (
    <div className="sw-flex sw-flex-col sw-items-center">
      <Heading as="h1" hasMarginBottom>
        {translate('maintenance.upgrade_database')}
      </Heading>

      <div>
        <Text as="p">{translate('maintenance.upgrade_database.1')}</Text>

        <Text as="p">
          <FormattedMessage
            defaultMessage={translate('maintenance.upgrade_database.2')}
            id="maintenance.upgrade_database.2"
            values={{
              link: (
                <DocumentationLink
                  highlight={LinkHighlight.Default}
                  to={DocLink.ServerUpgradeRoadmap}
                >
                  <Text isHighlighted>{translate('maintenance.upgrade_database.2.link')}</Text>
                </DocumentationLink>
              ),
            }}
          />
        </Text>
      </div>

      <Button
        className="sw-mt-6"
        id="start-migration"
        onClick={handleMigrateClick}
        variety={ButtonVariety.Primary}
      >
        {translate('maintenance.upgrade')}
      </Button>
    </div>
  );
}
