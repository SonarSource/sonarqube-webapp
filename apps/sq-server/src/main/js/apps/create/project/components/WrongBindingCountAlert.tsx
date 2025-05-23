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

import { Link, MessageCallout, MessageType } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { useAppState } from '~sq-server-commons/context/app-state/withAppStateContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getGlobalSettingsUrl } from '~sq-server-commons/helpers/urls';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';
import { ALM_INTEGRATION_CATEGORY } from '../../../settings/constants';

export interface WrongBindingCountAlertProps {
  alm: AlmKeys;
}

export default function WrongBindingCountAlert(props: WrongBindingCountAlertProps) {
  const { alm } = props;
  const { canAdmin } = useAppState();

  return (
    <MessageCallout
      className="sw-mb-2"
      text={
        canAdmin ? (
          <FormattedMessage
            id="onboarding.create_project.wrong_binding_count.admin"
            values={{
              alm: translate('onboarding.alm', alm),
              url: (
                <Link to={getGlobalSettingsUrl(ALM_INTEGRATION_CATEGORY)}>
                  {translate('settings.page')}
                </Link>
              ),
            }}
          />
        ) : (
          <FormattedMessage
            id="onboarding.create_project.wrong_binding_count"
            values={{
              alm: translate('onboarding.alm', alm),
            }}
          />
        )
      }
      type={MessageType.Danger}
    />
  );
}
