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

import { isEmpty, pickBy } from 'lodash';
import * as React from 'react';
import { getWrappedDisplayName } from '~shared/components/hoc/utils';
import { StaleTime } from '~shared/queries/common';
import { useLanguagesQuery } from '~shared/queries/languages';
import { Languages } from '~shared/types/languages';
import { useSearchRulesQuery } from '../../queries/rules';

export interface WithLanguagesProps {
  languages: Languages;
  languagesWithRules: Languages;
}

export default function withLanguages<P>(
  WrappedComponent: React.ComponentType<React.PropsWithChildren<P & WithLanguagesProps>>,
) {
  function WithLanguagesWrapper(
    props: Readonly<Omit<P, keyof WithLanguagesProps>>,
  ): React.ReactElement {
    const { data: languages = {} } = useLanguagesQuery();
    const languagesWithRules = useLanguagesWithRules();

    return (
      <WrappedComponent
        languages={languages}
        languagesWithRules={languagesWithRules}
        {...(props as P)}
      />
    );
  }

  WithLanguagesWrapper.displayName = getWrappedDisplayName(
    WrappedComponent,
    'WithLanguagesWrapper',
  );

  return WithLanguagesWrapper;
}

export function useLanguagesWithRules() {
  const { data: languages } = useLanguagesQuery();
  const { data: languagesWithRulesData } = useSearchRulesQuery(
    {
      facets: 'languages',
    },
    { enabled: !isEmpty(languages), staleTime: StaleTime.NEVER },
  );

  const languagesWithRules =
    languagesWithRulesData?.facets
      ?.find((facet) => facet.property === 'languages')
      ?.values.map(({ val }) => val) ?? [];

  return pickBy(languages, ({ key }) => languagesWithRules.includes(key));
}
