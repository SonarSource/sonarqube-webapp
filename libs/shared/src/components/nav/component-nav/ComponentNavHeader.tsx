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
import { forwardRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { To } from 'react-router-dom';
import Avatar from '~adapters/components/ui/Avatar';
import { History, RecentHistory } from '../../../helpers/recent-history';
import { getProjectOverviewUrl } from '../../../helpers/urls';
import { LightComponent } from '../../../types/component';

interface Props {
  allProjectsUrl: To;
  component: LightComponent;
  getItemUrl?: (component: History) => To;
  recentHistoryFilter?: (history: History) => boolean;
}

const MAX_RECENTLY_BROWSED = 8;

export function ComponentNavHeader(props: Readonly<Props>) {
  const { allProjectsUrl, component, getItemUrl, recentHistoryFilter = () => true } = props;
  const recentlyBrowsed = RecentHistory.get()
    .filter((c) => c.key !== component.key && recentHistoryFilter(c))
    .slice(0, MAX_RECENTLY_BROWSED);

  if (recentlyBrowsed.length < 1) {
    return <SidebarNavigationHeader component={component} />;
  }

  return (
    <DropdownMenu
      align="start"
      id="component-nav-dropdown-menu"
      items={[
        <DropdownMenu.ItemButtonCheckable
          className="fs-mask"
          isChecked
          key={component.key}
          prefix={<Avatar name={component.name} size="xs" />}
        >
          {component.name}
        </DropdownMenu.ItemButtonCheckable>,
        ...recentlyBrowsed.map((component) => (
          <DropdownMenu.ItemLink
            className="fs-mask"
            isActive={false}
            key={component.key}
            prefix={<Avatar name={component.name} size="xs" />}
            to={getItemUrl ? getItemUrl(component) : getProjectOverviewUrl(component.key)}
          >
            {component.name}
          </DropdownMenu.ItemLink>
        )),
        <DropdownMenu.Separator key="separator" />,
        <DropdownMenu.ItemLink className="sw-min-w-abs-250" key="all-projects" to={allProjectsUrl}>
          <FormattedMessage id="navigation.view_all" />
        </DropdownMenu.ItemLink>,
      ]}
      side="right"
    >
      <SidebarNavigationHeader component={component} isInteractive />
    </DropdownMenu>
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
        <Tooltip content={<span className="fs-mask">{component.name}</span>} side="right">
          <span className="fs-mask sw-block sw-truncate">{component.name}</span>
        </Tooltip>
      }
      qualifier={<FormattedMessage id={`qualifier.${component.qualifier}`} />}
      ref={ref}
      {...rest}
    />
  );
});

SidebarNavigationHeader.displayName = 'SidebarNavigationHeader';
