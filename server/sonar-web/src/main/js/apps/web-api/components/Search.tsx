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

import { Checkbox } from '@sonarsource/echoes-react';
import { InputSearch } from '~design-system';
import DocumentationLink from '../../../components/common/DocumentationLink';
import { DocLink } from '../../../helpers/doc-links';
import { translate } from '../../../helpers/l10n';
import { Query } from '../utils';

interface Props {
  onSearch: (search: string) => void;
  onToggleDeprecated: () => void;
  onToggleInternal: () => void;
  query: Query;
}

export default function Search(props: Readonly<Props>) {
  const { query, onToggleInternal, onToggleDeprecated } = props;

  return (
    <div>
      <div>
        <InputSearch
          onChange={props.onSearch}
          placeholder={translate('api_documentation.search')}
          value={query.search}
        />
      </div>

      <div className="sw-mt-4 sw-px-1 sw-max-w-[18rem]">
        <Checkbox
          checked={query.internal}
          helpText={translate('api_documentation.internal_tooltip')}
          label={translate('api_documentation.show_internal')}
          onCheck={onToggleInternal}
        />
      </div>

      <div className="sw-flex sw-px-1 sw-items-center sw-mt-2 sw-gap-2">
        <Checkbox
          checked={query.deprecated}
          helpText={
            <DocumentationLink shouldOpenInNewTab to={DocLink.DeprecatedFeatures}>
              {translate('api_documentation.show_deprecated.learn_more')}
            </DocumentationLink>
          }
          label={translate('api_documentation.show_deprecated')}
          onCheck={onToggleDeprecated}
        />
      </div>
    </div>
  );
}
