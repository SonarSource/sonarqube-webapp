/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
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
import ConditionOperator from './ConditionOperator';
import Period from './Period';
import ConditionModal from './ConditionModal';
import DeleteConditionForm from './DeleteConditionForm';
import { Condition as ICondition, Metric, QualityGate } from '../../../app/types';
import ActionsDropdown, { ActionsDropdownItem } from '../../../components/controls/ActionsDropdown';
import { translate, getLocalizedMetricName } from '../../../helpers/l10n';
import { formatMeasure } from '../../../helpers/measures';

interface Props {
  condition: ICondition;
  canEdit: boolean;
  metric: Metric;
  organization?: string;
  onRemoveCondition: (Condition: ICondition) => void;
  onSaveCondition: (newCondition: ICondition, oldCondition: ICondition) => void;
  qualityGate: QualityGate;
}

interface State {
  error: string;
  modal: boolean;
  op?: string;
  period?: number;
  warning: string;
}

export default class Condition extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      period: props.condition.period,
      modal: false,
      op: props.condition.op,
      warning: props.condition.warning || '',
      error: props.condition.error || ''
    };
  }

  handleUpdateCondition = (newCondition: ICondition) => {
    this.props.onSaveCondition(newCondition, this.props.condition);
  };

  handleCancelClick = () => {
    this.props.onRemoveCondition(this.props.condition);
  };

  handleOpenUpdate = () => this.setState({ modal: true });

  handleUpdateClose = () => this.setState({ modal: false });

  render() {
    const { condition, canEdit, metric, organization, qualityGate } = this.props;
    return (
      <tr>
        <td className="text-middle">
          {getLocalizedMetricName(metric)}
          {metric.hidden && (
            <span className="text-danger little-spacer-left">{translate('deprecated')}</span>
          )}
        </td>

        <td className="thin text-middle nowrap">
          <Period canEdit={false} metric={metric} period={condition.period === 1} />
        </td>

        <td className="thin text-middle nowrap">
          <ConditionOperator canEdit={false} metric={metric} op={condition.op} />
        </td>

        <td className="thin text-middle nowrap">{formatMeasure(condition.warning, metric.type)}</td>

        <td className="thin text-middle nowrap">{formatMeasure(condition.error, metric.type)}</td>

        {canEdit && (
          <td className="thin text-middle nowrap">
            <ActionsDropdown className="dropdown-menu-right">
              <ActionsDropdownItem className="js-condition-update" onClick={this.handleOpenUpdate}>
                {translate('update_details')}
              </ActionsDropdownItem>
              <DeleteConditionForm
                condition={condition}
                metric={metric}
                onDelete={this.props.onRemoveCondition}
                organization={organization}
              />
            </ActionsDropdown>
            {this.state.modal && (
              <ConditionModal
                condition={condition}
                header={translate('quality_gates.update_condition')}
                metric={metric}
                onAddCondition={this.handleUpdateCondition}
                onClose={this.handleUpdateClose}
                organization={organization}
                qualityGate={qualityGate}
              />
            )}
          </td>
        )}
      </tr>
    );
  }
}
