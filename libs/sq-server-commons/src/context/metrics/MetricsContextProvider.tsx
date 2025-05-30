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

import { keyBy } from 'lodash';
import * as React from 'react';
import { Metric } from '~shared/types/measures';
import { getAllMetrics } from '../../api/metrics';
import { MetricsContext } from './MetricsContext';

interface State {
  metrics: Record<string, Metric>;
}

export default class MetricsContextProvider extends React.PureComponent<
  React.PropsWithChildren,
  State
> {
  mounted = false;
  state: State = {
    metrics: {},
  };

  componentDidMount() {
    this.mounted = true;
    this.fetchMetrics();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchMetrics = async () => {
    const metricList = await getAllMetrics();
    if (this.mounted) {
      this.setState({ metrics: keyBy(metricList, 'key') });
    }
  };

  render() {
    return (
      <MetricsContext.Provider value={this.state.metrics}>
        {this.props.children}
      </MetricsContext.Provider>
    );
  }
}
