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
import { withRouter, WithRouterProps } from 'react-router';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import DetailsHeader from './DetailsHeader';
import DetailsContent from './DetailsContent';
import { getMetrics, Store } from '../../../store/rootReducer';
import { fetchMetrics } from '../../../store/rootActions';
import { fetchQualityGate } from '../../../api/quality-gates';
import { checkIfDefault, addCondition, replaceCondition, deleteCondition } from '../utils';

interface OwnProps {
  onSetDefault: (qualityGate: T.QualityGate) => void;
  organization?: string;
  params: { id: number };
  qualityGates: T.QualityGate[];
  refreshQualityGates: () => Promise<void>;
}

interface StateToProps {
  metrics: { [key: string]: T.Metric };
}

interface DispatchToProps {
  fetchMetrics: () => void;
}

type Props = StateToProps & DispatchToProps & OwnProps & WithRouterProps;

interface State {
  loading: boolean;
  qualityGate?: T.QualityGate;
}

export class DetailsApp extends React.PureComponent<Props, State> {
  mounted = false;
  state: State = { loading: true };

  componentDidMount() {
    this.mounted = true;
    this.props.fetchMetrics();
    this.fetchDetails();
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.params.id !== this.props.params.id) {
      this.setState({ loading: true });
      this.fetchDetails(nextProps);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchDetails = ({ organization, params } = this.props) => {
    return fetchQualityGate({ id: params.id, organization }).then(
      qualityGate => {
        if (this.mounted) {
          this.setState({ loading: false, qualityGate });
        }
      },
      () => {
        if (this.mounted) {
          this.setState({ loading: false });
        }
      }
    );
  };

  handleAddCondition = (condition: T.Condition) => {
    this.setState(({ qualityGate }) => {
      if (!qualityGate) {
        return null;
      }
      return { qualityGate: addCondition(qualityGate, condition) };
    });
  };

  handleSaveCondition = (newCondition: T.Condition, oldCondition: T.Condition) => {
    this.setState(({ qualityGate }) => {
      if (!qualityGate) {
        return null;
      }
      return { qualityGate: replaceCondition(qualityGate, newCondition, oldCondition) };
    });
  };

  handleRemoveCondition = (condition: T.Condition) => {
    this.setState(({ qualityGate }) => {
      if (!qualityGate) {
        return null;
      }
      return { qualityGate: deleteCondition(qualityGate, condition) };
    });
  };

  handleSetDefault = () => {
    this.setState(({ qualityGate }) => {
      if (!qualityGate) {
        return null;
      }
      this.props.onSetDefault(qualityGate);
      const newQualityGate: T.QualityGate = {
        ...qualityGate,
        actions: { ...qualityGate.actions, delete: false, setAsDefault: false }
      };
      return { qualityGate: newQualityGate };
    });
  };

  render() {
    const { organization, metrics, refreshQualityGates } = this.props;
    const { qualityGate } = this.state;

    if (!qualityGate) {
      return null;
    }

    return (
      <>
        <Helmet title={qualityGate.name} />
        <div className="layout-page-main">
          <DetailsHeader
            onSetDefault={this.handleSetDefault}
            organization={organization}
            qualityGate={qualityGate}
            refreshItem={this.fetchDetails}
            refreshList={refreshQualityGates}
          />
          <DetailsContent
            isDefault={checkIfDefault(qualityGate, this.props.qualityGates)}
            metrics={metrics}
            onAddCondition={this.handleAddCondition}
            onRemoveCondition={this.handleRemoveCondition}
            onSaveCondition={this.handleSaveCondition}
            organization={organization}
            qualityGate={qualityGate}
          />
        </div>
      </>
    );
  }
}

const mapDispatchToProps: DispatchToProps = { fetchMetrics };

const mapStateToProps = (state: Store): StateToProps => ({
  metrics: getMetrics(state)
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(DetailsApp)
);
