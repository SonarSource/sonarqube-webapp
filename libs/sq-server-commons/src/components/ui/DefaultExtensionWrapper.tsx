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

import { Layout } from '@sonarsource/echoes-react';
import { PropsWithChildren } from 'react';
import { GlobalFooter } from '~adapters/components/layout/GlobalFooter';

// Wrapper for legacy extensions that don't receive a page template.
export function DefaultExtensionWrapper({ children }: Readonly<PropsWithChildren<{}>>) {
  return (
    <Layout.PageGrid width="fluid">
      <Layout.PageContent>{children}</Layout.PageContent>

      <GlobalFooter />
    </Layout.PageGrid>
  );
}
