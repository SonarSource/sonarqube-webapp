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
import { sortBy, uniq, without } from 'lodash';
import { searchAssignees, formatFacetStat, Query, ReferencedUser } from '../utils';
import { Component } from '../../../app/types';
import FacetBox from '../../../components/facet/FacetBox';
import FacetFooter from '../../../components/facet/FacetFooter';
import FacetHeader from '../../../components/facet/FacetHeader';
import FacetItem from '../../../components/facet/FacetItem';
import FacetItemsList from '../../../components/facet/FacetItemsList';
import Avatar from '../../../components/ui/Avatar';
import { translate } from '../../../helpers/l10n';

export interface Props {
  assigned: boolean;
  assignees: string[];
  component: Component | undefined;
  facetMode: string;
  loading?: boolean;
  onChange: (changes: Partial<Query>) => void;
  onToggle: (property: string) => void;
  open: boolean;
  organization: string | undefined;
  stats: { [x: string]: number } | undefined;
  referencedUsers: { [login: string]: ReferencedUser };
}

export default class AssigneeFacet extends React.PureComponent<Props> {
  property = 'assignees';

  static defaultProps = {
    open: true
  };

  handleItemClick = (itemValue: string, multiple: boolean) => {
    const { assignees } = this.props;
    if (itemValue === '') {
      // unassigned
      this.props.onChange({ assigned: !this.props.assigned, assignees: [] });
    } else if (multiple) {
      const newValue = sortBy(
        assignees.includes(itemValue) ? without(assignees, itemValue) : [...assignees, itemValue]
      );
      this.props.onChange({ assigned: true, [this.property]: newValue });
    } else {
      this.props.onChange({
        assigned: true,
        [this.property]: assignees.includes(itemValue) && assignees.length < 2 ? [] : [itemValue]
      });
    }
  };

  handleHeaderClick = () => {
    this.props.onToggle(this.property);
  };

  handleClear = () => {
    this.props.onChange({ assigned: true, assignees: [] });
  };

  handleSearch = (query: string) => {
    return searchAssignees(query, this.props.organization);
  };

  handleSelect = (option: { value: string }) => {
    const { assignees } = this.props;
    this.props.onChange({ assigned: true, [this.property]: uniq([...assignees, option.value]) });
  };

  isAssigneeActive(assignee: string) {
    return assignee === '' ? !this.props.assigned : this.props.assignees.includes(assignee);
  }

  getAssigneeName(assignee: string) {
    if (assignee === '') {
      return translate('unassigned');
    } else {
      const { referencedUsers } = this.props;
      if (referencedUsers[assignee]) {
        return (
          <span>
            <Avatar
              className="little-spacer-right"
              hash={referencedUsers[assignee].avatar}
              name={referencedUsers[assignee].name}
              size={16}
            />
            {referencedUsers[assignee].name}
          </span>
        );
      } else {
        return assignee;
      }
    }
  }

  getStat(assignee: string) {
    const { stats } = this.props;
    return stats ? stats[assignee] : undefined;
  }

  getValues() {
    const values = this.props.assignees.map(assignee => {
      const user = this.props.referencedUsers[assignee];
      return user ? user.name : assignee;
    });
    if (!this.props.assigned) {
      values.push(translate('unassigned'));
    }
    return values;
  }

  renderOption = (option: { avatar: string; label: string }) => {
    return (
      <span>
        {option.avatar !== undefined && (
          <Avatar
            className="little-spacer-right"
            hash={option.avatar}
            name={option.label}
            size={16}
          />
        )}
        {option.label}
      </span>
    );
  };

  renderList() {
    const { stats } = this.props;

    if (!stats) {
      return null;
    }

    const assignees = sortBy(
      Object.keys(stats),
      // put unassigned first
      key => (key === '' ? 0 : 1),
      // the sort by number
      key => -stats[key]
    );

    return (
      <FacetItemsList>
        {assignees.map(assignee => (
          <FacetItem
            active={this.isAssigneeActive(assignee)}
            key={assignee}
            loading={this.props.loading}
            name={this.getAssigneeName(assignee)}
            onClick={this.handleItemClick}
            stat={formatFacetStat(this.getStat(assignee), this.props.facetMode)}
            tooltip={this.props.assignees.length === 1 && !this.isAssigneeActive(assignee)}
            value={assignee}
          />
        ))}
      </FacetItemsList>
    );
  }

  renderFooter() {
    if (!this.props.stats) {
      return null;
    }

    return (
      <FacetFooter
        onSearch={this.handleSearch}
        onSelect={this.handleSelect}
        renderOption={this.renderOption}
      />
    );
  }

  render() {
    return (
      <FacetBox property={this.property}>
        <FacetHeader
          name={translate('issues.facet', this.property)}
          onClear={this.handleClear}
          onClick={this.handleHeaderClick}
          open={this.props.open}
          values={this.getValues()}
        />

        {this.props.open && this.renderList()}
        {this.props.open && this.renderFooter()}
      </FacetBox>
    );
  }
}
