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

import { NavBarTabLink, NavBarTabs } from '~design-system';
import { translate } from '~sq-server-shared/helpers/l10n';

export default function Nav() {
  return (
    <NavBarTabs className="it__account-nav">
      <NavBarTabLink end text={translate('my_account.profile')} to="/account" />
      <NavBarTabLink text={translate('my_account.security')} to="/account/security" />
      <NavBarTabLink text={translate('my_account.notifications')} to="/account/notifications" />
      <NavBarTabLink text={translate('my_account.projects')} to="/account/projects" />
    </NavBarTabs>
  );
}
