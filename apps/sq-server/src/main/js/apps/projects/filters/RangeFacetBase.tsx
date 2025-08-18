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

import { Text } from '@sonarsource/echoes-react';
import classNames from 'classnames';
import * as React from 'react';
import { FacetBox, FacetItem, HighlightedFacetItems } from '~design-system';
import { isDefined } from '~shared/helpers/types';
import { RawQuery } from '~shared/types/router';
import { FacetItemsList } from '~sq-server-commons/components/facets/FacetItemsList';
import { translate } from '~sq-server-commons/helpers/l10n';
import { formatFacetStat } from '~sq-server-commons/utils/issues-utils';
import { Facet } from '../types';

export type Option = string | number;

interface Props {
  className?: string;
  description?: string;
  facet?: Facet;
  getFacetValueForOption?: (facet: Facet, option: Option) => number;
  header: string;
  highlightUnder?: number;
  highlightUnderMax?: number;

  maxFacetValue?: number;
  onQueryChange: (change: RawQuery) => void;
  optionClassName?: string;
  options: Option[];

  property: string;

  renderAccessibleLabel: (option: Option) => string;
  renderOption: (option: Option, isSelected: boolean) => React.ReactNode;

  value?: Option;
}

const defaultGetFacetValueForOption = (facet: Facet, option: string | number) => facet[option];

export default class RangeFacetBase extends React.PureComponent<Props> {
  isSelected(option: Option): boolean {
    const { value } = this.props;

    return String(option) === String(value);
  }

  highlightUnder(option?: number): boolean {
    return (
      this.props.highlightUnder !== undefined &&
      option !== undefined &&
      option > this.props.highlightUnder &&
      (this.props.highlightUnderMax == null || option < this.props.highlightUnderMax)
    );
  }

  handleClick = (clicked: string) => {
    const { property, onQueryChange, value } = this.props;

    if (clicked === value?.toString()) {
      onQueryChange({ [property]: undefined });
    } else {
      onQueryChange({
        [property]: clicked,
      });
    }
  };

  renderOption(option: Option) {
    const {
      optionClassName,
      facet,
      getFacetValueForOption = defaultGetFacetValueForOption,
      maxFacetValue,
      value,
    } = this.props;
    const active = this.isSelected(option);

    const facetValue =
      facet && getFacetValueForOption ? getFacetValueForOption(facet, option) : undefined;

    const isUnderSelectedOption =
      typeof value === 'number' &&
      typeof option === 'number' &&
      this.highlightUnder(value) &&
      option > value;

    const statBarPercent =
      isDefined(facetValue) && isDefined(maxFacetValue) && maxFacetValue > 0
        ? facetValue / maxFacetValue
        : undefined;

    return (
      <FacetItem
        active={active}
        aria-label={this.props.renderAccessibleLabel(option)}
        className={classNames(optionClassName)}
        data-key={option}
        disableZero={false}
        key={option}
        name={this.props.renderOption(option, this.isSelected(option) || isUnderSelectedOption)}
        onClick={this.handleClick}
        stat={formatFacetStat(facetValue) ?? 0}
        statBarPercent={statBarPercent}
        value={option.toString()}
      />
    );
  }

  renderOptions = () => {
    const { options, header, highlightUnder } = this.props;

    if (options && options.length > 0) {
      if (highlightUnder != null) {
        const max = this.props.highlightUnderMax ?? options.length;
        const beforeHighlight = options.slice(0, highlightUnder);
        const insideHighlight = options.slice(highlightUnder, max);
        const afterHighlight = options.slice(max);

        return (
          <FacetItemsList label={header}>
            {beforeHighlight.map((option) => this.renderOption(option))}
            <HighlightedFacetItems>
              {insideHighlight.map((option) => this.renderOption(option))}
            </HighlightedFacetItems>
            {afterHighlight.map((option) => this.renderOption(option))}
          </FacetItemsList>
        );
      }

      return <ul>{options.map((option) => this.renderOption(option))}</ul>;
    }

    return (
      <Text isSubtle>
        <em>{translate('projects.facets.no_available_filters_clear_others')}</em>
      </Text>
    );
  };

  render() {
    const { className, header, property, description } = this.props;

    return (
      <FacetBox className={className} data-key={property} name={header} open>
        {description && (
          <Text className="sw-mb-4 sw--mt-2 sw-block" isSubtle>
            {description}
          </Text>
        )}
        {this.renderOptions()}
      </FacetBox>
    );
  }
}
