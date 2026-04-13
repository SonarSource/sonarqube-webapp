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

import { Button, Spinner, toast } from '@sonarsource/echoes-react';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  DropdownMenu,
  DropdownToggler,
  ItemButton,
  PopupPlacement,
  PopupZLevel,
} from '~design-system';
import { useAvailableIDEs } from '~shared/helpers/useAvailableIDEs';
import type { Ide } from '~shared/types/sonarqube-ide';
import { openHotspot, probeSonarLintServers } from '~sq-server-commons/helpers/sonarlint';

interface Props {
  hotspotKey: string;
  projectKey: string;
}

const showError = () =>
  toast.error({ description: <FormattedMessage id="hotspots.open_in_ide.failure" /> });

const showSuccess = () =>
  toast.success({ description: <FormattedMessage id="hotspots.open_in_ide.success" /> });

export function HotspotOpenInIdeButton({ hotspotKey, projectKey }: Readonly<Props>) {
  const [isOpening, setIsOpening] = useState(false);

  const { availableIDEs, closeDropdown, findAvailableIDEs, isLookingForIDEs } = useAvailableIDEs({
    onError: showError,
    onSingleIDEFound: openHotspotInIDE,
    probe: probeSonarLintServers,
  });

  const isLoading = isLookingForIDEs || isOpening;

  return (
    <div>
      <DropdownToggler
        allowResizing
        onRequestClose={closeDropdown}
        open={availableIDEs.length > 1}
        overlay={
          <DropdownMenu size="auto">
            {availableIDEs.map((ide) => {
              const { ideName, description } = ide;
              const label = ideName + (description ? ` - ${description}` : '');

              return (
                <ItemButton
                  key={ide.port}
                  onClick={() => {
                    void openHotspotInIDE(ide);
                  }}
                >
                  {label}
                </ItemButton>
              );
            })}
          </DropdownMenu>
        }
        placement={PopupPlacement.BottomLeft}
        zLevel={PopupZLevel.Global}
      >
        <Button onClick={findAvailableIDEs} suffix={<Spinner isLoading={isLoading} />}>
          <FormattedMessage id="open_in_ide" />
        </Button>
      </DropdownToggler>
    </div>
  );

  async function openHotspotInIDE(ide: Ide) {
    closeDropdown();
    setIsOpening(true);

    try {
      await openHotspot(ide.port, projectKey, hotspotKey);
      showSuccess();
    } catch {
      showError();
    } finally {
      setIsOpening(false);
    }
  }
}
