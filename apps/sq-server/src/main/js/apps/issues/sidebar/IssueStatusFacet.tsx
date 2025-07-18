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

import { isEqual, sortBy, without } from 'lodash';
import { useIntl } from 'react-intl';
import { FacetBox, FacetItem } from '~design-system';
import MultipleSelectionHint from '~shared/components/MultipleSelectionHint';
import { FacetHelp } from '~sq-server-commons/components/facets/FacetHelp';
import { FacetItemsList } from '~sq-server-commons/components/facets/FacetItemsList';
import { DEFAULT_ISSUES_QUERY } from '~sq-server-commons/components/shared/utils';
import { ISSUE_STATUSES } from '~sq-server-commons/helpers/constants';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { IssueStatus } from '~sq-server-commons/types/issues';
import { formatFacetStat } from '~sq-server-commons/utils/issues-utils';
import { CommonProps } from './SimpleListStyleFacet';

interface Props extends CommonProps {
  issueStatuses: Array<IssueStatus>;
}

const property = 'issueStatuses';
const headerId = `facet_${property}`;

const defaultStatuses = DEFAULT_ISSUES_QUERY.issueStatuses.split(',') as IssueStatus[];

export function IssueStatusFacet(props: Readonly<Props>) {
  const { issueStatuses = [], stats = {}, fetching, open, help, needIssueSync } = props;
  const intl = useIntl();

  const nbSelectableItems = ISSUE_STATUSES.filter(
    (item) => !defaultStatuses.includes(item) && stats[item],
  ).length;
  const hasDefaultSelection = isEqual(sortBy(issueStatuses), sortBy(defaultStatuses));
  const nbSelectedItems = hasDefaultSelection ? 0 : issueStatuses.length;

  return (
    <FacetBox
      className="it__search-navigator-facet-box it__search-navigator-facet-header"
      count={nbSelectedItems}
      countLabel={intl.formatMessage({ id: 'x_selected' }, { '0': nbSelectedItems })}
      data-property={property}
      help={help ?? <FacetHelp link={DocLink.IssueStatuses} property="issueStatuses" />}
      id={headerId}
      loading={fetching}
      name={intl.formatMessage({ id: `issues.facet.${property}` })}
      onClear={() => {
        props.onChange({
          [property]: defaultStatuses,
        });
      }}
      onClick={() => {
        props.onToggle(property);
      }}
      open={open}
    >
      <FacetItemsList labelledby={headerId}>
        {ISSUE_STATUSES.map((item) => {
          const active = issueStatuses.includes(item);
          const stat = stats[item];

          return (
            <FacetItem
              active={active}
              className="it__search-navigator-facet"
              key={item}
              name={intl.formatMessage({ id: `issue.issue_status.${item}` })}
              onClick={(itemValue: IssueStatus, multiple) => {
                if (multiple) {
                  props.onChange({
                    [property]: active
                      ? without(issueStatuses, itemValue)
                      : [...issueStatuses, itemValue],
                  });
                } else {
                  props.onChange({
                    [property]: active && issueStatuses.length === 1 ? [] : [itemValue],
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
        selectedItems={issueStatuses.length}
        totalItems={nbSelectableItems}
      />
    </FacetBox>
  );
}
