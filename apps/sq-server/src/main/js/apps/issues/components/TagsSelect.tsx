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

import { BadgeCounter, Button, DropdownMenu, IconChevronDown } from '@sonarsource/echoes-react';
import * as React from 'react';
import { MultiSelector } from '~design-system';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';

interface Props {
  allowCreation: boolean;
  inputId?: string;
  label?: string;
  onChange: (selected: string[]) => void;
  onSearch: (query: string) => Promise<string[]>;
  selectedTags: string[];
}

export default function TagsSelect(props: Props) {
  const { allowCreation, inputId, label, onSearch, onChange, selectedTags } = props;
  const [searchResults, setSearchResults] = React.useState<string[]>([]);

  const doSearch = React.useCallback(
    async (query: string) => {
      const results = await onSearch(query);
      setSearchResults(results);
    },
    [onSearch, setSearchResults],
  );

  const onSelect = React.useCallback(
    (newTag: string) => {
      onChange([...selectedTags, newTag]);
    },
    [onChange, selectedTags],
  );

  const onUnselect = React.useCallback(
    (toRemove: string) => {
      onChange(selectedTags.filter((tag) => tag !== toRemove));
    },
    [onChange, selectedTags],
  );

  return (
    <DropdownMenu
      id="tag-selector"
      items={
        <MultiSelector
          allowNewElements={allowCreation}
          createElementLabel={translateWithParameters('issue.create_tag')}
          elements={searchResults}
          headerLabel={translate('issue_bulk_change.select_tags')}
          noResultsLabel={translate('no_results')}
          onSearch={doSearch}
          onSelect={onSelect}
          onUnselect={onUnselect}
          searchInputAriaLabel={translate('search.search_for_tags')}
          selectedElements={selectedTags}
        />
      }
      side="bottom"
    >
      <Button
        ariaLabel={label}
        id={inputId}
        suffix={
          <>
            <BadgeCounter value={selectedTags.length} />
            <IconChevronDown />
          </>
        }
      >
        {translate('select_verb')}
      </Button>
    </DropdownMenu>
  );
}
