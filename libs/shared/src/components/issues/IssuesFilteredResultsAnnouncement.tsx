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

import { useIntl } from 'react-intl';

interface Props {
  isFiltered: boolean;
  loading: boolean;
  total: number;
}

export function IssuesFilteredResultsAnnouncement({ isFiltered, loading, total }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  let message = '​';

  if (!loading && isFiltered) {
    if (total === 0) {
      message = `${formatMessage({ id: 'no_results_search' })} ${formatMessage({ id: 'no_results_search.2' })}`;
    } else {
      message = formatMessage({ id: 'issues.x_results_found' }, { count: total });
    }
  }

  return (
    // Always mounted so screen readers detect the content change when results go empty
    <output aria-atomic="true" aria-live="polite" className="sw-sr-only">
      {message}
    </output>
  );
}
