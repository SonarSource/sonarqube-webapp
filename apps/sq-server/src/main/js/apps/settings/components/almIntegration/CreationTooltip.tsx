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
import { FormattedMessage } from 'react-intl';
import Tooltip from '~sq-server-commons/components/controls/Tooltip';
import withAppStateContext from '~sq-server-commons/context/app-state/withAppStateContext';
import { getEdition, getEditionUrl } from '~sq-server-commons/helpers/editions';
import { translate } from '~sq-server-commons/helpers/l10n';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';
import { AppState } from '~sq-server-commons/types/appstate';
import { EditionKey } from '~sq-server-commons/types/editions';

export interface CreationTooltipProps {
  alm: AlmKeys;
  appState: AppState;
  children: React.ReactElement<{}>;
  preventCreation: boolean;
}

export function CreationTooltip(props: CreationTooltipProps) {
  const {
    alm,
    appState: { edition },
    children,
    preventCreation,
  } = props;

  const sourceEdition = edition ? EditionKey[edition] : undefined;

  return (
    <Tooltip
      content={
        preventCreation ? (
          <FormattedMessage
            id="settings.almintegration.create.tooltip"
            values={{
              link: (
                <a
                  href={getEditionUrl(getEdition(EditionKey.enterprise), {
                    sourceEdition,
                  })}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {translate('settings.almintegration.create.tooltip.link')}
                </a>
              ),
              alm: translate('alm', alm),
            }}
          />
        ) : null
      }
      mouseLeaveDelay={0.25}
    >
      {children}
    </Tooltip>
  );
}

export default withAppStateContext(CreationTooltip);
