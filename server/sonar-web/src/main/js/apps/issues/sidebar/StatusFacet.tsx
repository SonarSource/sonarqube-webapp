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
import { orderBy, without } from 'lodash';
import { formatFacetStat, Query } from '../utils';
import FacetBox from '../../../components/facet/FacetBox';
import FacetHeader from '../../../components/facet/FacetHeader';
import FacetItem from '../../../components/facet/FacetItem';
import FacetItemsList from '../../../components/facet/FacetItemsList';
import StatusHelper from '../../../components/shared/StatusHelper';
import { translate } from '../../../helpers/l10n';

interface Props {
  facetMode: string;
  loading?: boolean;
  onChange: (changes: Partial<Query>) => void;
  onToggle: (property: string) => void;
  open: boolean;
  stats: { [x: string]: number } | undefined;
  statuses: string[];
}

export default class StatusFacet extends React.PureComponent<Props> {
  property = 'statuses';

  static defaultProps = {
    open: true
  };

  handleItemClick = (itemValue: string, multiple: boolean) => {
    const { statuses } = this.props;
    if (multiple) {
      const newValue = orderBy(
        statuses.includes(itemValue) ? without(statuses, itemValue) : [...statuses, itemValue]
      );
      this.props.onChange({ [this.property]: newValue });
    } else {
      this.props.onChange({
        [this.property]: statuses.includes(itemValue) && statuses.length < 2 ? [] : [itemValue]
      });
    }
  };

  handleHeaderClick = () => {
    this.props.onToggle(this.property);
  };

  handleClear = () => {
    this.props.onChange({ [this.property]: [] });
  };

  getStat(status: string) {
    const { stats } = this.props;
    return stats ? stats[status] : undefined;
  }

  renderItem = (status: string) => {
    const active = this.props.statuses.includes(status);
    const stat = this.getStat(status);

    return (
      <FacetItem
        active={active}
        disabled={stat === 0 && !active}
        halfWidth={true}
        key={status}
        loading={this.props.loading}
        name={<StatusHelper resolution={undefined} status={status} />}
        onClick={this.handleItemClick}
        stat={formatFacetStat(stat, this.props.facetMode)}
        tooltip={this.props.statuses.length === 1 && !this.props.statuses.includes(status)}
        value={status}
      />
    );
  };

  render() {
    const statuses = ['OPEN', 'RESOLVED', 'REOPENED', 'CLOSED', 'CONFIRMED'];
    const values = this.props.statuses.map(status => translate('issue.status', status));

    return (
      <FacetBox property={this.property}>
        <FacetHeader
          name={translate('issues.facet', this.property)}
          onClear={this.handleClear}
          onClick={this.handleHeaderClick}
          open={this.props.open}
          values={values}
        />

        {this.props.open && <FacetItemsList>{statuses.map(this.renderItem)}</FacetItemsList>}
      </FacetBox>
    );
  }
}
