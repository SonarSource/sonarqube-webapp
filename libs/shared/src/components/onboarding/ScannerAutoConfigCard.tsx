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
  Card,
  CardSize,
  Link,
  LinkHighlight,
  MessageCallout,
  Text,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Switch } from '~adapters/components/common/Switch';
import { BetaBadge } from '../badges/BetaBadge';

interface Props {
  canAdministerProject: boolean;
  docUrl: string;
  isEnabled: boolean;
  isPending: boolean;
  onChange: (isEnabled: boolean) => void;
  /** Android projects are not supported by the automatic configuration of Gradle projects yet. */
  showAndroidInfo?: boolean;
}

function ScannerAutoConfigCard(props: Readonly<Props>) {
  const { canAdministerProject, docUrl, isEnabled, isPending, onChange, showAndroidInfo } = props;
  const { formatMessage } = useIntl();

  return (
    <Card className="sw:mb-6" size={CardSize.Medium}>
      <Card.Body>
        <div className="sw:flex sw:items-center sw:gap-2 sw:mb-2">
          <Switch
            ariaLabel={formatMessage({ id: 'onboarding.scanner_autoconfig.toggle' })}
            disabled={!canAdministerProject || isPending}
            name="scanner-autoconfig-status"
            onChange={onChange}
            value={isEnabled}
          />
          <Text isHighlighted>
            <FormattedMessage id="onboarding.scanner_autoconfig.toggle" />
          </Text>
          <BetaBadge />
        </div>

        <p>
          <FormattedMessage
            id="onboarding.scanner_autoconfig.description"
            values={{
              link: (text) => (
                <Link enableOpenInNewTab highlight={LinkHighlight.Subtle} to={docUrl}>
                  {text}
                </Link>
              ),
            }}
          />
        </p>

        {showAndroidInfo && (
          <MessageCallout className="sw:mt-4" variety="info">
            <FormattedMessage id="onboarding.scanner_autoconfig.android_info" />
          </MessageCallout>
        )}

        {!canAdministerProject && (
          <MessageCallout className="sw:mt-4" variety="info">
            <FormattedMessage id="onboarding.scanner_autoconfig.admin_required" />
          </MessageCallout>
        )}
      </Card.Body>
    </Card>
  );
}

export { ScannerAutoConfigCard };
