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
  ButtonVariety,
  DropdownMenu,
  DropdownMenuAlign,
  IconQuestionMark,
  Layout,
} from '@sonarsource/echoes-react';
import { useCallback, useEffect, useState } from 'react';
import { CustomEvents } from '../../helpers/constants';
import { translate } from '../../helpers/l10n';
import { EmbedDocsPopup } from './EmbedDocsPopup';

export default function EmbedDocsPopupHelper() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openListener = () => {
      setOpen(true);
    };
    const closeListener = () => {
      setOpen(false);
    };
    document.addEventListener(CustomEvents.OpenHelpMenu, openListener);
    document.addEventListener(CustomEvents.CloseHelpMenu, closeListener);
    return () => {
      document.removeEventListener(CustomEvents.OpenHelpMenu, openListener);
      document.addEventListener(CustomEvents.CloseHelpMenu, closeListener);
    };
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    document.dispatchEvent(new CustomEvent(CustomEvents.HelpMenuClosed));
  }, []);

  return (
    <DropdownMenu
      align={DropdownMenuAlign.End}
      id="help-menu-dropdown"
      isOpen={open}
      items={<EmbedDocsPopup />}
      onClose={handleClose}
      onOpen={() => {
        setOpen(true);
      }}
    >
      <Layout.GlobalNavigation.Action
        Icon={IconQuestionMark}
        ariaLabel={translate('help')}
        isIconFilled
        variety={ButtonVariety.DefaultGhost}
      />
    </DropdownMenu>
  );
}
