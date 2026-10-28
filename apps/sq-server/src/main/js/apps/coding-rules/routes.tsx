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

import { useEffect } from 'react';
import { Route, useLocation } from 'react-router';
import { useRouter } from '~shared/components/hoc/withRouter';
import { lazyLoadComponent } from '~shared/helpers/lazyLoadComponent';
import { RawQuery } from '~shared/types/router';
import { parseQuery, serializeQuery } from '~sq-server-commons/utils/coding-rules-query';

const CodingRulesApp = lazyLoadComponent(() => import('./components/CodingRulesApp'));

const EXPECTED_SPLIT_PARTS = 2;

function parseHash(hash: string): RawQuery {
  const query: RawQuery = {};
  const parts = hash.split('|');
  parts.forEach((part) => {
    const tokens = part.split('=');
    if (tokens.length === EXPECTED_SPLIT_PARTS) {
      query[decodeURIComponent(tokens[0])] = decodeURIComponent(tokens[1]);
    }
  });
  return query;
}

function HashEditWrapper() {
  const location = useLocation();
  const { replace } = useRouter();

  useEffect(() => {
    const { hash } = location;
    if (hash.length > 1) {
      const query = parseHash(hash.substring(1));
      const normalizedQuery = serializeQuery(parseQuery(query));

      if (typeof query.open === 'string') {
        normalizedQuery.open = query.open;
      }

      replace({
        pathname: location.pathname,
        search: new URLSearchParams(normalizedQuery).toString(),
      });
    }
  }, [location, replace]);

  return <CodingRulesApp />;
}

const routes = () => <Route element={<HashEditWrapper />} path="coding_rules" />;

export default routes;
