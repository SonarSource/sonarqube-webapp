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

import * as React from 'react';
import { ComponentQualifier } from '~shared/types/component';
import { getValue } from '~sq-server-commons/api/settings';
import withAppStateContext from '~sq-server-commons/context/app-state/withAppStateContext';
import { AppState } from '~sq-server-commons/types/appstate';
import { HousekeepingPolicy, RangeOption } from '~sq-server-commons/types/audit-logs';
import { SettingsKey } from '~sq-server-commons/types/settings';
import '../style.css';
import AuditAppRenderer from './AuditAppRenderer';

interface Props {
  appState: AppState;
}

interface State {
  dateRange?: { from?: Date; to?: Date };
  downloadStarted: boolean;
  housekeepingPolicy: HousekeepingPolicy;
  selection: RangeOption;
}

export class AuditApp extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      downloadStarted: false,
      housekeepingPolicy: HousekeepingPolicy.Monthly,
      selection: RangeOption.Today,
    };
  }

  componentDidMount() {
    if (this.hasGovernanceExtension()) {
      this.fetchHouseKeepingPolicy();
    }
  }

  fetchHouseKeepingPolicy = async () => {
    const result = await getValue({ key: SettingsKey.AuditHouseKeeping });

    this.setState({
      housekeepingPolicy:
        (result?.value as HousekeepingPolicy | undefined) ?? HousekeepingPolicy.Monthly,
    });
  };

  hasGovernanceExtension = () => {
    return Boolean(this.props.appState?.qualifiers.includes(ComponentQualifier.Portfolio));
  };

  handleDateSelection = (dateRange: { from?: Date; to?: Date }) => {
    this.setState({ dateRange, downloadStarted: false, selection: RangeOption.Custom });
  };

  handleOptionSelection = (selection: RangeOption) => {
    this.setState({ dateRange: undefined, downloadStarted: false, selection });
  };

  handleStartDownload = () => {
    setTimeout(() => {
      this.setState({ downloadStarted: true });
    }, 0);
  };

  render() {
    if (!this.hasGovernanceExtension()) {
      return null;
    }

    return (
      <AuditAppRenderer
        handleDateSelection={this.handleDateSelection}
        handleOptionSelection={this.handleOptionSelection}
        handleStartDownload={this.handleStartDownload}
        {...this.state}
      />
    );
  }
}

export default withAppStateContext(AuditApp);
