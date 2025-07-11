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

import { without } from 'lodash';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { FacetBox, FacetItem } from '~design-system';
import MultipleSelectionHint from '~shared/components/MultipleSelectionHint';
import { FacetItemsList } from '~sq-server-commons/components/facets/FacetItemsList';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { IssuesQuery } from '~sq-server-commons/types/issues';
import { formatFacetStat } from '~sq-server-commons/utils/issues-utils';

export interface CommonProps {
  fetching: boolean;
  help?: React.ReactNode;
  needIssueSync?: boolean;
  onChange: (changes: Partial<IssuesQuery>) => void;
  onToggle: (property: string) => void;
  open: boolean;
  secondLine?: string;
  stats: Record<string, number> | undefined;
}

interface Props<T = string> extends CommonProps {
  itemNamePrefix: string;
  listItems: Array<T>;
  property: string;
  renderIcon?: (item: string, disabled: boolean) => React.ReactNode;
  selectedItems: Array<T>;
}

export function SimpleListStyleFacet(props: Props) {
  const {
    fetching,
    open,
    selectedItems = [],
    secondLine,
    stats = {},
    needIssueSync,
    property,
    listItems,
    itemNamePrefix,
    help,
    renderIcon,
  } = props;
  const intl = useIntl();

  const nbSelectableItems = listItems.filter((item) => stats[item]).length;
  const nbSelectedItems = selectedItems.length;
  const headerId = `facet_${property}`;

  return (
    <FacetBox
      className="it__search-navigator-facet-box it__search-navigator-facet-header"
      count={nbSelectedItems}
      countLabel={translateWithParameters('x_selected', nbSelectedItems)}
      data-property={property}
      help={help}
      id={headerId}
      loading={fetching}
      name={intl.formatMessage({ id: `issues.facet.${property}` })}
      onClear={() => {
        props.onChange({ [property]: [] });
      }}
      onClick={() => {
        props.onToggle(property);
      }}
      open={open}
      secondLine={secondLine}
    >
      <FacetItemsList labelledby={headerId}>
        {listItems.map((item) => {
          const active = selectedItems.includes(item);
          const stat = stats[item];
          const disabled = stat === 0 || typeof stat === 'undefined';

          return (
            <FacetItem
              active={active}
              className="it__search-navigator-facet"
              icon={renderIcon?.(item, disabled)}
              key={item}
              name={translate(itemNamePrefix, item)}
              onClick={(itemValue, multiple) => {
                if (multiple) {
                  props.onChange({
                    [property]: active
                      ? without(selectedItems, itemValue)
                      : [...selectedItems, itemValue],
                  });
                } else {
                  props.onChange({
                    [property]: active && selectedItems.length === 1 ? [] : [itemValue],
                  });
                }
              }}
              stat={(!needIssueSync && formatFacetStat(stat)) ?? 0}
              value={item}
            />
          );
        })}
      </FacetItemsList>

      <MultipleSelectionHint
        className="sw-pt-4"
        selectedItems={nbSelectedItems}
        totalItems={nbSelectableItems}
      />
    </FacetBox>
  );
}
