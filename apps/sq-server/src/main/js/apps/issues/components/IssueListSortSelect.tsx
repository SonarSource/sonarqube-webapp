/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource Sàrl
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

import { Select, Text } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { IssueListSortField } from '~sq-server-commons/types/issues';
import { ISSUE_LIST_SORT_FIELDS } from '~sq-server-commons/utils/issues-utils';

interface Props {
  /** The 3 dropdown values map to several possible `s` values (mode-aware); anything else (e.g. a
   * sort reached via a raw `?s=` URL param this dropdown doesn't offer) has no known field. */
  knownField?: IssueListSortField;
  onChange: (sortField: IssueListSortField) => void;
  /** The exact `s` value currently in effect, shown verbatim when it has no `knownField`. */
  rawValue: string;
}

const SORT_LABEL_ID = 'issue-list-sort-label';
const UNKNOWN_SORT_VALUE = '__unknown_sort__';

export function IssueListSortSelect({ knownField, onChange, rawValue }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  const options: Array<{ label: string; value: string }> = ISSUE_LIST_SORT_FIELDS.map((field) => ({
    label: formatMessage({ id: `issues.sort.${field}` }),
    value: field,
  }));

  // Sorted by something the dropdown doesn't offer (e.g. a value only reachable via the URL):
  // show it as-is rather than mapping it to one of the 3 known labels.
  if (rawValue && knownField === undefined) {
    options.push({ label: rawValue, value: UNKNOWN_SORT_VALUE });
  }

  return (
    <div className="sw-flex sw-items-center sw-gap-2">
      <Text id={SORT_LABEL_ID} isSubtle>
        {formatMessage({ id: 'issues.sort.label' })}
      </Text>
      <Select
        ariaLabelledBy={SORT_LABEL_ID}
        data={options}
        hasDropdownAutoWidth
        isNotClearable
        onChange={(value) => {
          if (value && value !== UNKNOWN_SORT_VALUE) {
            onChange(value as IssueListSortField);
          }
        }}
        value={knownField ?? UNKNOWN_SORT_VALUE}
        width="small"
      />
    </div>
  );
}
