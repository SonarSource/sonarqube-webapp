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

import { sortBy } from 'lodash';
import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { A11ySkipLink } from '../../types/common';
import { A11yContext } from './A11yContext';

export function A11yProvider({ children }: Readonly<PropsWithChildren>) {
  const [links, setLinks] = useState<A11ySkipLink[]>([]);

  const addA11ySkipLink = useCallback((link: A11ySkipLink) => {
    setLinks((prev) => {
      const links: A11ySkipLink[] = [...prev];
      links.push({ ...link, weight: link.weight || 0 });

      return links;
    });
  }, []);

  const removeA11ySkipLink = useCallback((link: A11ySkipLink) => {
    setLinks((prevState) => {
      return prevState.filter((l) => l.key !== link.key);
    });
  }, []);

  const memoizedProvider = useMemo(() => {
    return {
      addA11ySkipLink,
      links: sortBy(links, 'weight'),
      removeA11ySkipLink,
    };
  }, [addA11ySkipLink, links, removeA11ySkipLink]);

  return <A11yContext.Provider value={memoizedProvider}>{children}</A11yContext.Provider>;
}
