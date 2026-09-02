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

import {
  Button,
  ButtonVariety,
  Card,
  IconRecommended,
  Text,
  TextSize,
} from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { DocLink } from '../../../helpers/doc-links';
import { useDocUrl } from '../../../helpers/docs';

interface Props {
  isFullyImported: boolean;
}

export function ImportRepositoriesExtraCard({ isFullyImported }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const docUrl = useDocUrl();

  if (isFullyImported) {
    return null;
  }

  return (
    <Card className="sw-max-w-[650px]">
      <Card.Body className="sw-flex sw-items-center sw-justify-between">
        <div className="sw-flex sw-flex-col sw-gap-2">
          <span className="sw-flex sw-min-w-0 sw-items-center sw-gap-2">
            <IconRecommended color="echoes-color-icon-accent" isFilled />
            <Text isHighlighted>
              {formatMessage({ id: 'onboarding_dashboard.journey.import.cli_title' })}
            </Text>
          </span>

          <Text as="p" isSubtle size={TextSize.Small}>
            {formatMessage({ id: 'onboarding_dashboard.journey.import.cli_description' })}
          </Text>
        </div>

        <Button
          enableOpenInNewTab
          to={docUrl(DocLink.CLIImportRepositories)}
          variety={ButtonVariety.Default}
        >
          {formatMessage({ id: 'onboarding_dashboard.journey.import.cli_cta' })}
        </Button>
      </Card.Body>
    </Card>
  );
}
