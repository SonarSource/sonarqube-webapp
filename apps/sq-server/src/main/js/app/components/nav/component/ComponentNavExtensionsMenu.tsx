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

import { IconDashboard, Layout } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { BranchLike } from '~sq-server-commons/types/branch-like';
import { Component } from '~sq-server-commons/types/types';

interface Props {
  branchLike?: BranchLike;
  component: Component;
}

export function ComponentNavExtensionsMenu(props: Readonly<Props>) {
  const { branchLike, component } = props;
  const { extensions = [], qualifier } = component;

  const branchParameters = getBranchLikeQuery(branchLike);
  const withoutOfficialExtensions = extensions.filter(
    (extension) =>
      !extension.key.startsWith('securityreport/') && !extension.key.startsWith('governance/'),
  );

  if (withoutOfficialExtensions.length === 0) {
    return null;
  }

  return (
    <Layout.SidebarNavigation.AccordionItem
      Icon={IconDashboard}
      label={<FormattedMessage id="navigation.project.group.extensions" />}
    >
      {withoutOfficialExtensions.map((extension) => (
        <Layout.SidebarNavigation.Item
          Icon={IconDashboard}
          disableIconWhenSidebarOpen
          key={extension.key}
          to={{
            pathname: `/project/extension/${extension.key}`,
            search: new URLSearchParams({
              id: component.key,
              ...branchParameters,
              qualifier,
            }).toString(),
          }}
        >
          {/* eslint-disable-next-line react/forbid-component-props */}
          <FormattedMessage defaultMessage={extension.name} id={extension.name} />
        </Layout.SidebarNavigation.Item>
      ))}
    </Layout.SidebarNavigation.AccordionItem>
  );
}
