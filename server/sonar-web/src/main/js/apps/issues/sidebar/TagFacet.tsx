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
import { searchIssueTags } from '../../../api/issues';
import * as theme from '../../../app/theme';
import { Component } from '../../../app/types';
import FacetBox from '../../../components/facet/FacetBox';
import FacetFooter from '../../../components/facet/FacetFooter';
import FacetHeader from '../../../components/facet/FacetHeader';
import FacetItem from '../../../components/facet/FacetItem';
import FacetItemsList from '../../../components/facet/FacetItemsList';
import TagsIcon from '../../../components/icons-components/TagsIcon';
import { translate } from '../../../helpers/l10n';

interface Props {
  component: Component | undefined;
  facetMode: string;
  loading?: boolean;
  onChange: (changes: Partial<Query>) => void;
  onToggle: (property: string) => void;
  open: boolean;
  organization: string | undefined;
  stats: { [x: string]: number } | undefined;
  tags: string[];
}

export default class TagFacet extends React.PureComponent<Props> {
  property = 'tags';

  static defaultProps = {
    open: true
  };

  handleItemClick = (itemValue: string, multiple: boolean) => {
    const { tags } = this.props;
    if (multiple) {
      const { tags } = this.props;
      const newValue = sortBy(
        tags.includes(itemValue) ? without(tags, itemValue) : [...tags, itemValue]
      );
      this.props.onChange({ [this.property]: newValue });
    } else {
      this.props.onChange({
        [this.property]: tags.includes(itemValue) && tags.length < 2 ? [] : [itemValue]
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
    return searchIssueTags({ organization: this.props.organization, ps: 50, q: query }).then(tags =>
      tags.map(tag => ({ label: tag, value: tag }))
    );
  };

  handleSelect = (option: { value: string }) => {
    const { tags } = this.props;
    this.props.onChange({ [this.property]: uniq([...tags, option.value]) });
  };

  getStat(tag: string) {
    const { stats } = this.props;
    return stats ? stats[tag] : undefined;
  }

  renderTag(tag: string) {
    return (
      <span>
        <TagsIcon className="little-spacer-right" fill={theme.gray60} />
        {tag}
      </span>
    );
  }

  renderList() {
    const { stats } = this.props;

    if (!stats) {
      return null;
    }

    const tags = sortBy(Object.keys(stats), key => -stats[key]);

    return (
      <FacetItemsList>
        {tags.map(tag => (
          <FacetItem
            active={this.props.tags.includes(tag)}
            key={tag}
            loading={this.props.loading}
            name={this.renderTag(tag)}
            onClick={this.handleItemClick}
            stat={formatFacetStat(this.getStat(tag), this.props.facetMode)}
            tooltip={this.props.tags.length === 1 && !this.props.tags.includes(tag)}
            value={tag}
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
    return (
      <FacetBox property={this.property}>
        <FacetHeader
          name={translate('issues.facet', this.property)}
          onClear={this.handleClear}
          onClick={this.handleHeaderClick}
          open={this.props.open}
          values={this.props.tags}
        />

        {this.props.open && this.renderList()}

        {this.props.open && this.renderFooter()}
      </FacetBox>
    );
  }
}
