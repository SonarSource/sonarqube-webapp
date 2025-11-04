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
  Badge,
  BadgeVariety,
  Button,
  ButtonVariety,
  MessageInline,
  MessageVariety,
  Popover,
} from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';

export interface Props {
  buttonKey: string;
}

export default function IdeButtonSafariDisabled({ buttonKey }: Readonly<Props>) {
  return (
    <div>
      <Button className="sw-whitespace-nowrap" isDisabled variety={ButtonVariety.Primary}>
        <FormattedMessage id={buttonKey} />
      </Button>

      <Popover
        description={<FormattedMessage id="open_in_ide.safari.not_supported.description" />}
        title={<FormattedMessage id="open_in_ide.safari.not_supported.title" />}
      >
        <Badge className="sw-ml-2" isInteractive variety={BadgeVariety.Info}>
          <MessageInline variety={MessageVariety.Info}>
            <FormattedMessage id="open_in_ide.safari.not_supported" />
          </MessageInline>
        </Badge>
      </Popover>
    </div>
  );
}
