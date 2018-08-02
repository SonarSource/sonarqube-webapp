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
import { formatFacetStat, Query } from '../utils';
import { searchRules } from '../../../api/rules';
import FacetBox from '../../../components/facet/FacetBox';
import FacetHeader from '../../../components/facet/FacetHeader';
import FacetItem from '../../../components/facet/FacetItem';
import FacetItemsList from '../../../components/facet/FacetItemsList';
import FacetFooter from '../../../components/facet/FacetFooter';
import { translate } from '../../../helpers/l10n';
import DeferredSpinner from '../../../components/common/DeferredSpinner';

interface Props {
  fetching: boolean;
  languages: string[];
  loading?: boolean;
  onChange: (changes: Partial<Query>) => void;
  onToggle: (property: string) => void;
  open: boolean;
  organization: string | undefined;
  referencedRules: { [ruleKey: string]: { name: string } };
  rules: string[];
  stats: { [x: string]: number } | undefined;
}

export default class RuleFacet extends React.PureComponent<Props> {
  property = 'rules';

  static defaultProps = {
    open: true
  };

  handleItemClick = (itemValue: string, multiple: boolean) => {
    const { rules } = this.props;
    if (multiple) {
      const newValue = sortBy(
        rules.includes(itemValue) ? without(rules, itemValue) : [...rules, itemValue]
      );
      this.props.onChange({ [this.property]: newValue });
    } else {
      this.props.onChange({
        [this.property]: rules.includes(itemValue) && rules.length < 2 ? [] : [itemValue]
      });
    }
  };

  handleHeaderClick = () => {
    this.props.onToggle(this.property);
  };

  handleClear = () => {
    this.props.onChange({ [this.property]: [] });
  };

  handleSearch = (query: string) => {
    const { languages, organization } = this.props;
    return searchRules({
      f: 'name,langName',
      languages: languages.length ? languages.join() : undefined,
      organization,
      q: query,
      include_external: true
    }).then(response =>
      response.rules.map(rule => ({ label: `(${rule.langName}) ${rule.name}`, value: rule.key }))
    );
  };

  handleSelect = (option: { value: string }) => {
    const { rules } = this.props;
    this.props.onChange({ [this.property]: uniq([...rules, option.value]) });
  };

  getRuleName(rule: string): string {
    const { referencedRules } = this.props;
    return referencedRules[rule] ? referencedRules[rule].name : rule;
  }

  getStat(rule: string) {
    const { stats } = this.props;
    return stats ? stats[rule] : undefined;
  }

  renderList() {
    const { stats } = this.props;

    if (!stats) {
      return null;
    }

    const rules = sortBy(Object.keys(stats), key => -stats[key], key => this.getRuleName(key));

    return (
      <FacetItemsList>
        {rules.map(rule => (
          <FacetItem
            active={this.props.rules.includes(rule)}
            key={rule}
            loading={this.props.loading}
            name={this.getRuleName(rule)}
            onClick={this.handleItemClick}
            stat={formatFacetStat(this.getStat(rule))}
            tooltip={this.props.rules.length === 1 && !this.props.rules.includes(rule)}
            value={rule}
          />
        ))}
      </FacetItemsList>
    );
  }

  renderFooter() {
    if (!this.props.stats) {
      return null;
    }

    return <FacetFooter onSearch={this.handleSearch} onSelect={this.handleSelect} />;
  }

  render() {
    const values = this.props.rules.map(rule => this.getRuleName(rule));
    return (
      <FacetBox property={this.property}>
        <FacetHeader
          name={translate('issues.facet', this.property)}
          onClear={this.handleClear}
          onClick={this.handleHeaderClick}
          open={this.props.open}
          values={values}
        />

        <DeferredSpinner loading={this.props.fetching} />
        {this.props.open && this.renderList()}
        {this.props.open && this.renderFooter()}
      </FacetBox>
    );
  }
}
