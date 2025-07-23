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

import { DropdownMenu, DropdownMenuAlign } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Location } from 'react-router-dom';
import { LightLabel, NavBarTabLink, NavBarTabs, TopBar } from '~design-system';
import { Extension } from '~shared/types/common';
import { addons } from '~sq-server-addons/index';
import withLocation from '~sq-server-commons/components/hoc/withLocation';
import { getIntl } from '~sq-server-commons/helpers/l10nBundle';
import { getBaseUrl } from '~sq-server-commons/helpers/system';
import { AdminPageExtension } from '~sq-server-commons/types/extension';
import { PendingPluginResult } from '~sq-server-commons/types/plugins';
import { SysStatus } from '~sq-server-commons/types/types';
import PendingPluginsActionNotif from './PendingPluginsActionNotif';
import SystemRestartNotif from './SystemRestartNotif';

interface Props {
  extensions: Extension[];
  fetchPendingPlugins: () => void;
  fetchSystemStatus: () => void;
  location: Location;
  pendingPlugins: PendingPluginResult;
  systemStatus: SysStatus;
}

export class SettingsNav extends React.PureComponent<Props> {
  intl = getIntl();

  static defaultProps = {
    extensions: [],
  };

  isSomethingActive = (urls: string[]) => {
    const path = this.props.location.pathname;

    return urls.some((url: string) => path.startsWith(getBaseUrl() + url));
  };

  isSecurityActive() {
    const urls = [
      '/admin/users',
      '/admin/groups',
      '/admin/permissions',
      '/admin/permission_templates',
    ];

    return this.isSomethingActive(urls);
  }

  isProjectsActive() {
    const urls = ['/admin/projects_management', '/admin/background_tasks'];

    return this.isSomethingActive(urls);
  }

  isSystemActive() {
    const urls = ['/admin/system'];

    return this.isSomethingActive(urls);
  }

  isMarketplace() {
    const urls = ['/admin/marketplace'];

    return this.isSomethingActive(urls);
  }

  isAudit() {
    const urls = ['/admin/audit'];

    return this.isSomethingActive(urls);
  }

  renderExtension = ({ key, name }: Extension) => {
    return (
      <DropdownMenu.ItemLink isMatchingFullPath key={key} to={`/admin/extension/${key}`}>
        {name}
      </DropdownMenu.ItemLink>
    );
  };

  renderConfigurationTab() {
    return (
      <DropdownMenu
        align={DropdownMenuAlign.Start}
        id="settings-navigation-configuration-dropdown"
        items={
          <>
            <DropdownMenu.ItemLink isMatchingFullPath to="/admin/settings">
              <FormattedMessage id="settings.page" />
            </DropdownMenu.ItemLink>

            <DropdownMenu.ItemLink isMatchingFullPath to="/admin/settings/encryption">
              <FormattedMessage id="property.category.security.encryption" />
            </DropdownMenu.ItemLink>

            <DropdownMenu.ItemLink isMatchingFullPath to="/admin/webhooks">
              <FormattedMessage id="webhooks.page" />
            </DropdownMenu.ItemLink>

            {this.props.extensions.map(this.renderExtension)}

            {addons.license && (
              <DropdownMenu.ItemLink isMatchingFullPath to="/admin/license/app">
                <FormattedMessage id="license.feature_name" />
              </DropdownMenu.ItemLink>
            )}
          </>
        }
      >
        <NavBarTabLink
          active={
            !this.isSecurityActive() &&
            !this.isProjectsActive() &&
            !this.isSystemActive() &&
            !this.isSomethingActive(['/admin/license/support']) &&
            !this.isMarketplace() &&
            !this.isAudit()
          }
          aria-haspopup="menu"
          id="settings-navigation-configuration"
          text={this.intl.formatMessage({ id: 'sidebar.project_settings' })}
          to={{}}
          withChevron
        />
      </DropdownMenu>
    );
  }

  renderProjectsTab() {
    return (
      <DropdownMenu
        id="settings-navigation-projects-dropdown"
        items={
          <>
            <DropdownMenu.ItemLink isMatchingFullPath to="/admin/projects_management">
              <FormattedMessage id="management" />
            </DropdownMenu.ItemLink>

            <DropdownMenu.ItemLink isMatchingFullPath to="/admin/background_tasks">
              <FormattedMessage id="background_tasks.page" />
            </DropdownMenu.ItemLink>
          </>
        }
      >
        <NavBarTabLink
          active={this.isProjectsActive()}
          aria-haspopup="menu"
          text={this.intl.formatMessage({ id: 'sidebar.projects' })}
          to={{}}
          withChevron
        />
      </DropdownMenu>
    );
  }

  renderSecurityTab() {
    return (
      <DropdownMenu
        id="settings-navigation-security-dropdown"
        items={
          <>
            <DropdownMenu.ItemLink isMatchingFullPath to="/admin/users">
              <FormattedMessage id="users.page" />
            </DropdownMenu.ItemLink>

            <DropdownMenu.ItemLink isMatchingFullPath to="/admin/groups">
              <FormattedMessage id="user_groups.page" />
            </DropdownMenu.ItemLink>

            <DropdownMenu.ItemLink isMatchingFullPath to="/admin/permissions">
              <FormattedMessage id="global_permissions.page" />
            </DropdownMenu.ItemLink>

            <DropdownMenu.ItemLink isMatchingFullPath to="/admin/permission_templates">
              <FormattedMessage id="permission_templates" />
            </DropdownMenu.ItemLink>
          </>
        }
      >
        <NavBarTabLink
          active={this.isSecurityActive()}
          aria-haspopup="menu"
          text={this.intl.formatMessage({ id: 'sidebar.security' })}
          to={{}}
          withChevron
        />
      </DropdownMenu>
    );
  }

  render() {
    const { extensions, pendingPlugins } = this.props;

    const hasGovernanceExtension = extensions.find(
      (e) => e.key === AdminPageExtension.GovernanceConsole,
    );

    const totalPendingPlugins =
      pendingPlugins.installing.length +
      pendingPlugins.removing.length +
      pendingPlugins.updating.length;

    let notifComponent;

    if (this.props.systemStatus === 'RESTARTING') {
      notifComponent = <SystemRestartNotif />;
    } else if (totalPendingPlugins > 0) {
      notifComponent = (
        <PendingPluginsActionNotif
          fetchSystemStatus={this.props.fetchSystemStatus}
          pending={pendingPlugins}
          refreshPending={this.props.fetchPendingPlugins}
          systemStatus={this.props.systemStatus}
        />
      );
    }

    return (
      <>
        <TopBar aria-label={this.intl.formatMessage({ id: 'settings' })} id="context-navigation">
          <LightLabel as="h1">{this.intl.formatMessage({ id: 'layout.settings' })}</LightLabel>

          <NavBarTabs className="it__navbar-tabs sw-mt-4">
            {this.renderConfigurationTab()}
            {this.renderSecurityTab()}
            {this.renderProjectsTab()}

            <NavBarTabLink
              end
              text={this.intl.formatMessage({ id: 'sidebar.system' })}
              to="/admin/system"
            />

            <NavBarTabLink
              end
              text={this.intl.formatMessage({ id: 'marketplace.page' })}
              to="/admin/marketplace"
            />

            {hasGovernanceExtension && (
              <NavBarTabLink
                end
                text={this.intl.formatMessage({ id: 'audit_logs.page' })}
                to="/admin/audit"
              />
            )}

            {addons.license && (
              <NavBarTabLink
                end
                text={this.intl.formatMessage({ id: 'support' })}
                to="/admin/license/support"
              />
            )}
          </NavBarTabs>
        </TopBar>

        {notifComponent}
      </>
    );
  }
}

export default withLocation(SettingsNav);
