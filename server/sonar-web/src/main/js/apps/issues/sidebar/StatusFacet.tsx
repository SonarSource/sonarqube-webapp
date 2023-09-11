/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
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

import {
  FacetBox,
  FacetItem,
  StatusConfirmedIcon,
  StatusOpenIcon,
  StatusReopenedIcon,
  StatusResolvedIcon,
} from 'design-system';
import { orderBy, without } from 'lodash';
import * as React from 'react';
import { STATUSES } from '../../../helpers/constants';
import { translate, translateWithParameters } from '../../../helpers/l10n';
import { Dict } from '../../../types/types';
import { Query, formatFacetStat } from '../utils';
import { FacetItemsColumns } from './FacetItemsColumns';
import { MultipleSelectionHint } from './MultipleSelectionHint';

interface Props {
  fetching: boolean;
  onChange: (changes: Partial<Query>) => void;
  onToggle: (property: string) => void;
  open: boolean;
  stats: Dict<number> | undefined;
  statuses: string[];
}

export class StatusFacet extends React.PureComponent<Props> {
  property = 'statuses';

  static defaultProps = { open: true };

  handleItemClick = (itemValue: string, multiple: boolean) => {
    const { statuses } = this.props;

    if (multiple) {
      const newValue = orderBy(
        statuses.includes(itemValue) ? without(statuses, itemValue) : [...statuses, itemValue],
      );

      this.props.onChange({ [this.property]: newValue });
    } else {
      this.props.onChange({
        [this.property]: statuses.includes(itemValue) && statuses.length < 2 ? [] : [itemValue],
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
        className="it__search-navigator-facet"
        icon={
          {
            CLOSED: <StatusResolvedIcon />,
            CONFIRMED: <StatusConfirmedIcon />,
            OPEN: <StatusOpenIcon />,
            REOPENED: <StatusReopenedIcon />,
            RESOLVED: <StatusResolvedIcon />,
          }[status]
        }
        key={status}
        name={translate('issue.status', status)}
        onClick={this.handleItemClick}
        stat={formatFacetStat(stat) ?? 0}
        tooltip={translate('issue.status', status)}
        value={status}
      />
    );
  };

  render() {
    const { fetching, open, statuses } = this.props;

    const nbSelectableItems = STATUSES.filter(this.getStat.bind(this)).length;
    const nbSelectedItems = statuses.length;
    const headerId = `facet_${this.property}`;

    return (
      <FacetBox
        className="it__search-navigator-facet-box it__search-navigator-facet-header"
        clearIconLabel={translate('clear')}
        count={nbSelectedItems}
        countLabel={translateWithParameters('x_selected', nbSelectedItems)}
        data-property={this.property}
        id={headerId}
        loading={fetching}
        name={translate('issues.facet', this.property)}
        onClear={this.handleClear}
        onClick={this.handleHeaderClick}
        open={open}
      >
        <FacetItemsColumns>{STATUSES.map(this.renderItem)}</FacetItemsColumns>

        <MultipleSelectionHint
          nbSelectableItems={nbSelectableItems}
          nbSelectedItems={nbSelectedItems}
        />
      </FacetBox>
    );
  }
}
