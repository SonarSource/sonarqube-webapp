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

import { Button, ButtonVariety } from '@sonarsource/echoes-react';
import * as React from 'react';
import Tooltip from '~sq-server-commons/components/controls/Tooltip';
import withCurrentUserContext from '~sq-server-commons/context/current-user/withCurrentUserContext';
import { translate } from '~sq-server-commons/helpers/l10n';
import { Hotspot, HotspotStatusOption } from '~sq-server-commons/types/security-hotspots';
import { CurrentUser, isLoggedIn } from '~sq-server-commons/types/users';
import StatusSelection from './StatusSelection';

export interface StatusProps {
  currentUser: CurrentUser;
  hotspot: Hotspot;
  onStatusChange: (statusOption: HotspotStatusOption) => Promise<void>;
}

export function StatusReviewButton(props: StatusProps) {
  const { currentUser, hotspot } = props;

  const [isOpen, setIsOpen] = React.useState(false);
  const readonly = !hotspot.canChangeStatus || !isLoggedIn(currentUser);

  return (
    <>
      <Tooltip
        content={readonly ? translate('hotspots.status.cannot_change_status') : null}
        side="bottom"
      >
        <Button
          id="status-trigger"
          isDisabled={readonly}
          onClick={() => {
            setIsOpen(true);
          }}
          variety={ButtonVariety.Primary}
        >
          {translate('hotspots.status.review')}
        </Button>
      </Tooltip>

      {isOpen && (
        <StatusSelection
          hotspot={hotspot}
          onClose={() => {
            setIsOpen(false);
          }}
          onStatusOptionChange={props.onStatusChange}
        />
      )}
    </>
  );
}

export default withCurrentUserContext(StatusReviewButton);
