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

import { Layout, LoadingSkeleton } from '@sonarsource/echoes-react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage } from 'react-intl';
import { withRouter } from '~shared/components/hoc/withRouter';
import { isDefined } from '~shared/helpers/types';
import { Location, Router } from '~shared/types/router';
import { addons } from '~sq-server-addons/index';
import { getSystemInfo } from '~sq-server-commons/api/system';
import { AdminPageTemplate } from '~sq-server-commons/components/ui/AdminPageTemplate';
import { getIntl } from '~sq-server-commons/helpers/l10nBundle';
import { LogsLevels } from '~sq-server-commons/types/system';
import { SysInfoCluster, SysInfoStandalone } from '~sq-server-commons/types/types';
import { UpdateNotification } from '../../../app/components/update-notification/UpdateNotification';
import '../styles.css';
import {
  Query,
  getClusterVersion,
  getServerId,
  getSystemLogsLevel,
  getVersion,
  isCluster,
  parseQuery,
  serializeQuery,
} from '../utils';
import ClusterSysInfos from './ClusterSysInfos';
import { PageActions } from './PageActions';
import PageHeader from './PageHeader';
import StandaloneSysInfos from './StandaloneSysInfos';

const MonitoringAlerts = addons.monitoringAlerts?.MonitoringAlerts || (() => undefined);

interface Props {
  location: Location;
  router: Router;
}

interface State {
  error: boolean;
  loading: boolean;
  sysInfoData?: SysInfoCluster | SysInfoStandalone;
}

class SystemApp extends React.PureComponent<Props, State> {
  mounted = false;
  intl = getIntl();
  state: State = { error: false, loading: true };

  componentDidMount() {
    this.mounted = true;
    this.fetchSysInfo();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchSysInfo = () => {
    this.setState({ loading: true });
    getSystemInfo().then(
      (sysInfoData) => {
        if (this.mounted) {
          this.setState({ loading: false, sysInfoData });
        }
      },
      () => {
        if (this.mounted) {
          this.setState({ error: true, loading: false });
        }
      },
    );
  };

  toggleSysInfoCards = (toggledCard: string) => {
    const query = parseQuery(this.props.location.query);
    let expandedCards;
    if (query.expandedCards.includes(toggledCard)) {
      expandedCards = query.expandedCards.filter((card) => card !== toggledCard);
    } else {
      expandedCards = query.expandedCards.concat(toggledCard);
    }
    this.updateQuery({ expandedCards });
  };

  updateQuery = (newQuery: Query) => {
    const query = serializeQuery({ ...parseQuery(this.props.location.query), ...newQuery });
    this.props.router.replace({ pathname: this.props.location.pathname, query });
  };

  renderSysInfo() {
    const { error, sysInfoData } = this.state;
    if (!sysInfoData || error) {
      return null;
    }

    const query = parseQuery(this.props.location.query);
    if (isCluster(sysInfoData)) {
      return (
        <ClusterSysInfos
          expandedCards={query.expandedCards}
          sysInfoData={sysInfoData}
          toggleCard={this.toggleSysInfoCards}
        />
      );
    }
    return (
      <StandaloneSysInfos
        expandedCards={query.expandedCards}
        sysInfoData={sysInfoData}
        toggleCard={this.toggleSysInfoCards}
      />
    );
  }

  render() {
    const { error, loading, sysInfoData } = this.state;
    return (
      <AdminPageTemplate
        actions={
          <LoadingSkeleton isLoading={loading} variety="rectangle">
            {!error && (
              <Layout.PageHeader.Actions>
                <PageActions
                  cluster={sysInfoData ? isCluster(sysInfoData) : false}
                  logLevel={sysInfoData ? getSystemLogsLevel(sysInfoData) : LogsLevels.INFO}
                  onLogLevelChange={this.fetchSysInfo}
                  serverId={sysInfoData && getServerId(sysInfoData)}
                />
              </Layout.PageHeader.Actions>
            )}
          </LoadingSkeleton>
        }
        breadcrumbs={[{ linkElement: <FormattedMessage id="system_info.page" /> }]}
        isLoading={loading}
        title={this.intl.formatMessage({ id: 'system_info.page' })}
      >
        <Helmet defer={false} title={this.intl.formatMessage({ id: 'system_info.page' })} />

        <div className="sw-flex sw-flex-col sw-gap-y-4 sw-mb-8 empty:sw-mb-0">
          <MonitoringAlerts />
          <UpdateNotification />
        </div>

        <PageHeader
          onLogLevelChange={this.fetchSysInfo}
          serverId={sysInfoData && getServerId(sysInfoData)}
          version={getSysInfoVersion(sysInfoData)}
        />

        <LoadingSkeleton className="sw-h-[400px] sw-w-3/4" variety="rectangle">
          {this.renderSysInfo()}
        </LoadingSkeleton>
      </AdminPageTemplate>
    );
  }
}

export default withRouter(SystemApp);

function getSysInfoVersion(sysInfoData: SysInfoCluster | SysInfoStandalone | undefined) {
  if (!isDefined(sysInfoData)) {
    return undefined;
  }

  return isCluster(sysInfoData) ? getClusterVersion(sysInfoData) : getVersion(sysInfoData);
}
