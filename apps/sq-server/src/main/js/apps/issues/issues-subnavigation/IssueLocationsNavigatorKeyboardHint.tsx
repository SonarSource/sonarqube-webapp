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

import { KeyboardHint } from '~shared/components/KeyboardHint';
import { KeyboardKeys } from '~sq-server-commons/helpers/keycodes';
import { translate } from '~sq-server-commons/helpers/l10n';

interface Props {
  showLeftRightHint?: boolean;
}

export default function IssueLocationsNavigatorKeyboardHint({ showLeftRightHint }: Props) {
  const leftRightHint = showLeftRightHint
    ? `${KeyboardKeys.LeftArrow} ${KeyboardKeys.RightArrow}`
    : '';
  return (
    <div className="sw-flex sw-justify-center sw-mt-4">
      <KeyboardHint
        command={`${KeyboardKeys.Alt} + ${KeyboardKeys.UpArrow} ${KeyboardKeys.DownArrow} ${leftRightHint}`}
        title={translate('issue.hint.navigate')}
      />
    </div>
  );
}
