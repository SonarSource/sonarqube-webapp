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

import { Helmet } from 'react-helmet-async';
import { useIntl } from 'react-intl';
import { Outlet } from 'react-router-dom';
import { PoliciesSidebar } from './nav/policies/PoliciesSidebar';

export function PoliciesContainer() {
  const { formatMessage } = useIntl();

  return (
    <>
      <PoliciesSidebar />
      <Helmet
        defer={false}
        titleTemplate={formatMessage(
          { id: 'page_title.template.with_category' },
          { page: formatMessage({ id: 'layout.policies' }) },
        )}
      />
      <Outlet />
    </>
  );
}
