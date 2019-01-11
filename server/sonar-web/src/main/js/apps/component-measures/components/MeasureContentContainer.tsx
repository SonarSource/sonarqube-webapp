/*
 * SonarQube
 * Copyright (C) 2009-2019 SonarSource SA
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
import { InjectedRouter } from 'react-router';
import MeasureContent from './MeasureContent';
import { Query, View } from '../utils';

interface Props {
  branchLike?: T.BranchLike;
  className?: string;
  rootComponent: T.ComponentMeasure;
  fetchMeasures: (
    component: string,
    metricsKey: string[],
    branchLike?: T.BranchLike
  ) => Promise<{ component: T.ComponentMeasure; measures: T.MeasureEnhanced[] }>;
  leakPeriod?: T.Period;
  metric: T.Metric;
  metrics: { [metric: string]: T.Metric };
  router: InjectedRouter;
  selected?: string;
  updateQuery: (query: Partial<Query>) => void;
  view: View;
}

interface LoadingState {
  measure: boolean;
  components: boolean;
  moreComponents: boolean;
}

interface State {
  component?: T.ComponentMeasure;
  loading: LoadingState;
  measure?: T.MeasureEnhanced;
  secondaryMeasure?: T.MeasureEnhanced;
}

export default class MeasureContentContainer extends React.PureComponent<Props, State> {
  mounted = false;
  state: State = { loading: { measure: false, components: false, moreComponents: false } };

  componentDidMount() {
    this.mounted = true;
    this.fetchMeasure(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    const { component } = this.state;
    const componentChanged =
      !component ||
      nextProps.rootComponent.key !== component.key ||
      nextProps.selected !== component.key;
    if (componentChanged || nextProps.metric !== this.props.metric) {
      this.fetchMeasure(nextProps);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchMeasure = ({ branchLike, rootComponent, fetchMeasures, metric, selected }: Props) => {
    this.updateLoading({ measure: true });

    const metricKeys = [metric.key];
    if (metric.key === 'ncloc') {
      metricKeys.push('ncloc_language_distribution');
    }

    fetchMeasures(selected || rootComponent.key, metricKeys, branchLike).then(
      ({ component, measures }) => {
        if (this.mounted) {
          const measure = measures.find(measure => measure.metric.key === metric.key);
          const secondaryMeasure = measures.find(measure => measure.metric.key !== metric.key);
          this.setState({ component, measure, secondaryMeasure });
          this.updateLoading({ measure: false });
        }
      },
      () => this.updateLoading({ measure: false })
    );
  };

  updateLoading = (loading: Partial<LoadingState>) => {
    if (this.mounted) {
      this.setState(state => ({ loading: { ...state.loading, ...loading } }));
    }
  };

  updateSelected = (component: string) => {
    this.props.updateQuery({
      selected: component !== this.props.rootComponent.key ? component : undefined
    });
  };

  updateView = (view: View) => {
    this.props.updateQuery({ view });
  };

  render() {
    if (!this.state.component) {
      return null;
    }

    return (
      <MeasureContent
        branchLike={this.props.branchLike}
        className={this.props.className}
        component={this.state.component}
        leakPeriod={this.props.leakPeriod}
        loading={this.state.loading.measure || this.state.loading.components}
        loadingMore={this.state.loading.moreComponents}
        measure={this.state.measure}
        metric={this.props.metric}
        metrics={this.props.metrics}
        rootComponent={this.props.rootComponent}
        router={this.props.router}
        secondaryMeasure={this.state.secondaryMeasure}
        updateLoading={this.updateLoading}
        updateSelected={this.updateSelected}
        updateView={this.updateView}
        view={this.props.view}
      />
    );
  }
}
