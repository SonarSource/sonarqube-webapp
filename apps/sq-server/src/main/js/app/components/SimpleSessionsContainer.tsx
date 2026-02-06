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

import { css, Global } from '@emotion/react';
import { Layout } from '@sonarsource/echoes-react';
import { Outlet } from 'react-router-dom';
import PageTracker from './PageTracker';

export default function SimpleSessionsContainer() {
  return (
    <>
      {/*FIXME Temporary override to base.css to be removed when migration is done */}
      <Global
        styles={css`
          body {
            overflow-y: hidden;
          }
        `}
      />
      <PageTracker />
      <Layout>
        <Layout.ContentGrid id="container">
          <Outlet />
        </Layout.ContentGrid>
      </Layout>
    </>
  );
}
