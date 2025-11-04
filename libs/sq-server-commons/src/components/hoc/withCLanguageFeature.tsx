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

import * as React from 'react';
import { getWrappedDisplayName } from '~shared/components/hoc/utils';
import { useLanguagesQuery } from '~shared/queries/languages';

export function withCLanguageFeature<P>(
  WrappedComponent: React.ComponentType<
    React.PropsWithChildren<P & { hasCLanguageFeature: boolean }>
  >,
) {
  function Wrapper(props: Omit<P, 'hasCLanguageFeature'>) {
    const { data: languages = {} } = useLanguagesQuery();
    const hasCLanguageFeature = languages.c !== undefined;

    return <WrappedComponent {...(props as P)} hasCLanguageFeature={hasCLanguageFeature} />;
  }

  Wrapper.displayName = getWrappedDisplayName(WrappedComponent, 'withCLanguageFeature');

  return Wrapper;
}
