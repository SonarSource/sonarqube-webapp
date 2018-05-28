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
import { sortBy, without } from 'lodash';
import { formatFacetStat, Query } from '../utils';
import FacetBox from '../../../components/facet/FacetBox';
import FacetHeader from '../../../components/facet/FacetHeader';
import FacetItem from '../../../components/facet/FacetItem';
import FacetItemsList from '../../../components/facet/FacetItemsList';
import { translate } from '../../../helpers/l10n';

interface Props {
  facetMode: string;
  loading?: boolean;
  onChange: (changes: Partial<Query>) => void;
  onToggle: (property: string) => void;
  open: boolean;
  stats: { [x: string]: number } | undefined;
  authors: string[];
}

export default class AuthorFacet extends React.PureComponent<Props> {
  property = 'authors';

  static defaultProps = {
    open: true
  };

  handleItemClick = (itemValue: string, multiple: boolean) => {
    const { authors } = this.props;
    if (multiple) {
      const newValue = sortBy(
        authors.includes(itemValue) ? without(authors, itemValue) : [...authors, itemValue]
      );
      this.props.onChange({ [this.property]: newValue });
    } else {
      this.props.onChange({
        [this.property]: authors.includes(itemValue) && authors.length < 2 ? [] : [itemValue]
      });
    }
  };

  handleHeaderClick = () => {
    this.props.onToggle(this.property);
  };

  handleClear = () => {
    this.props.onChange({ [this.property]: [] });
  };

  getStat(author: string) {
    const { stats } = this.props;
    return stats ? stats[author] : undefined;
  }

  renderList() {
    const { stats } = this.props;

    if (!stats) {
      return null;
    }

    const authors = sortBy(Object.keys(stats), key => -stats[key]);

    return (
      <FacetItemsList>
        {authors.map(author => (
          <FacetItem
            active={this.props.authors.includes(author)}
            key={author}
            loading={this.props.loading}
            name={author}
            onClick={this.handleItemClick}
            stat={formatFacetStat(this.getStat(author), this.props.facetMode)}
            tooltip={this.props.authors.length === 1 && !this.props.authors.includes(author)}
            value={author}
          />
        ))}
      </FacetItemsList>
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
          values={this.props.authors}
        />

        {this.props.open && this.renderList()}
      </FacetBox>
    );
  }
}
