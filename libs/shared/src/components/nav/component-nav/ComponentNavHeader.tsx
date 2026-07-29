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

import { DropdownMenu, Layout, Tooltip } from '@sonarsource/echoes-react';
import { ReactNode, forwardRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { To } from 'react-router-dom';
import Avatar from '~adapters/components/ui/Avatar';
import { History, RecentHistory } from '../../../helpers/recent-history';
import { getProjectOverviewUrl } from '../../../helpers/urls';
import { LightComponent } from '../../../types/component';
import { SidebarEntityDropdown } from './SidebarEntityDropdown';

interface Props {
  allProjectsUrl: To;
  component: LightComponent;
  getItemUrl?: (component: History) => To;
  recentlyBrowsedLabel?: ReactNode;
  recentHistoryFilter?: (history: History) => boolean;
}

const MAX_RECENTLY_BROWSED = 8;

export function ComponentNavHeader(props: Readonly<Props>) {
  const {
    allProjectsUrl,
    component,
    getItemUrl,
    recentlyBrowsedLabel,
    recentHistoryFilter = () => true,
  } = props;
  const recentlyBrowsed = RecentHistory.get()
    .filter((c) => c.key !== component.key && recentHistoryFilter(c))
    .slice(0, MAX_RECENTLY_BROWSED);

  return (
    <SidebarEntityDropdown
      currentItem={
        <DropdownMenu.ItemButtonCheckable
          isChecked
          prefix={<Avatar name={component.name} size="xs" />}
        >
          {component.name}
        </DropdownMenu.ItemButtonCheckable>
      }
      groupLabel={
        recentlyBrowsedLabel ?? <FormattedMessage id="sidebar.dropdown.recently_browsed" />
      }
      id="component-nav-dropdown-menu"
      items={recentlyBrowsed.map((component) => (
        <DropdownMenu.ItemLink
          isActive={false}
          key={component.key}
          prefix={<Avatar name={component.name} size="xs" />}
          to={getItemUrl ? getItemUrl(component) : getProjectOverviewUrl(component.key)}
        >
          {component.name}
        </DropdownMenu.ItemLink>
      ))}
      viewAllItem={
        <DropdownMenu.ItemLink key="all-projects" to={allProjectsUrl}>
          <FormattedMessage id="navigation.view_all_projects" />
        </DropdownMenu.ItemLink>
      }
    >
      <SidebarNavigationHeader component={component} isInteractive />
    </SidebarEntityDropdown>
  );
}

const SidebarNavigationHeader = forwardRef<
  HTMLButtonElement,
  Readonly<{ component: LightComponent; isInteractive?: boolean }>
>((props, ref) => {
  const { component, ...rest } = props;

  return (
    <Layout.SidebarNavigation.Header
      avatar={<Avatar name={component.name} size="sm" />}
      name={
        <Tooltip content={component.name} side="right">
          <span className="sw-block sw-truncate">{component.name}</span>
        </Tooltip>
      }
      qualifier={<FormattedMessage id={`qualifier.${component.qualifier}`} />}
      ref={ref}
      {...rest}
    />
  );
});

SidebarNavigationHeader.displayName = 'SidebarNavigationHeader';
