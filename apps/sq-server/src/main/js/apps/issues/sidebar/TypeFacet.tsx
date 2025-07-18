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

import { IconBug, IconCodeSmell, IconVulnerability } from '@sonarsource/echoes-react';
import { orderBy, without } from 'lodash';
import * as React from 'react';
import { FacetBox, FacetItem } from '~design-system';
import MultipleSelectionHint from '~shared/components/MultipleSelectionHint';
import { FacetItemsList } from '~sq-server-commons/components/facets/FacetItemsList';
import QGMetricsMismatchHelp from '~sq-server-commons/components/issues/sidebar/QGMetricsMismatchHelp';
import { ISSUE_TYPES } from '~sq-server-commons/helpers/constants';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { IssuesQuery } from '~sq-server-commons/types/issues';
import { formatFacetStat } from '~sq-server-commons/utils/issues-utils';

interface Props {
  fetching: boolean;
  needIssueSync?: boolean;
  onChange: (changes: Partial<IssuesQuery>) => void;
  onToggle: (property: string) => void;
  open: boolean;
  secondLine?: string;
  stats: Record<string, number> | undefined;
  types: string[];
}

const AVAILABLE_TYPES = ISSUE_TYPES.filter((t) => t !== 'SECURITY_HOTSPOT');

export class TypeFacet extends React.PureComponent<Props> {
  property = 'types';

  static defaultProps = {
    open: true,
  };

  handleItemClick = (itemValue: string, multiple: boolean) => {
    const { types } = this.props;

    if (multiple) {
      const newValue = orderBy(
        types.includes(itemValue) ? without(types, itemValue) : [...types, itemValue],
      );

      this.props.onChange({ [this.property]: newValue });
    } else {
      this.props.onChange({
        [this.property]: types.includes(itemValue) && types.length < 2 ? [] : [itemValue],
      });
    }
  };

  handleHeaderClick = () => {
    this.props.onToggle(this.property);
  };

  handleClear = () => {
    this.props.onChange({ [this.property]: [] });
  };

  getStat(type: string) {
    const { stats } = this.props;

    return stats ? stats[type] : undefined;
  }

  isFacetItemActive(type: string) {
    return this.props.types.includes(type);
  }

  renderItem = (type: string) => {
    const { needIssueSync } = this.props;
    const active = this.isFacetItemActive(type);
    const stat = this.getStat(type);

    return (
      <FacetItem
        active={active}
        className="it__search-navigator-facet"
        icon={
          {
            BUG: <IconBug className="sw-mr-1" />,
            CODE_SMELL: <IconCodeSmell className="sw-mr-1" />,
            VULNERABILITY: <IconVulnerability className="sw-mr-1" />,
          }[type]
        }
        key={type}
        name={translate('issue.type', type)}
        onClick={this.handleItemClick}
        stat={(!needIssueSync && formatFacetStat(stat)) ?? 0}
        value={type}
      />
    );
  };

  render() {
    const { fetching, open, types, secondLine } = this.props;

    const nbSelectableItems = AVAILABLE_TYPES.filter(this.getStat.bind(this)).length;
    const nbSelectedItems = types.length;
    const typeFacetHeaderId = `facet_${this.property}`;

    return (
      <FacetBox
        className="it__search-navigator-facet-box it__search-navigator-facet-header"
        count={nbSelectedItems}
        countLabel={translateWithParameters('x_selected', nbSelectedItems)}
        data-property={this.property}
        help={Boolean(secondLine) && <QGMetricsMismatchHelp />}
        id={typeFacetHeaderId}
        loading={fetching}
        name={translate('issues.facet', this.property)}
        onClear={this.handleClear}
        onClick={this.handleHeaderClick}
        open={open}
        secondLine={secondLine}
      >
        <FacetItemsList labelledby={typeFacetHeaderId}>
          {AVAILABLE_TYPES.map(this.renderItem)}
        </FacetItemsList>

        <MultipleSelectionHint
          className="sw-pt-4"
          selectedItems={nbSelectedItems}
          totalItems={nbSelectableItems}
        />
      </FacetBox>
    );
  }
}
