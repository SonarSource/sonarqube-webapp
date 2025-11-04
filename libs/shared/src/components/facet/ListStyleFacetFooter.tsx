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

import { cssVar, Link } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { numberFormatter } from '../../helpers/measures';

export interface Props {
  nbShown: number;
  showLess?: () => void;
  showLessAriaLabel?: string;
  showMore: () => void;
  showMoreAriaLabel?: string;
  total: number;
}

/**
 * This component is adapted from SQ Server's ListStyleFacetFooter.
 * It matches the functionality of SQ Cloud component <SearchFacetShowMore />
 * but their interfaces are different.
 * Future work will be needed to unify the two.
 */
export function ListStyleFacetFooter({
  nbShown,
  showLess,
  showLessAriaLabel,
  showMore,
  showMoreAriaLabel,
  total,
}: Readonly<Props>) {
  const hasMore = total > nbShown;
  const allShown = Boolean(total && total === nbShown);

  return (
    <div className="sw-mb-2 sw-mt-2 sw-text-center" style={{ color: cssVar('color-text-subtle') }}>
      <FormattedMessage id="x_show" values={{ 0: numberFormatter(nbShown) }} />

      {hasMore && (
        <Link aria-label={showMoreAriaLabel} className="sw-ml-2" onClick={showMore}>
          <FormattedMessage id="show_more" />
        </Link>
      )}

      {showLess && allShown && (
        <Link aria-label={showLessAriaLabel} className="sw-ml-2" onClick={showLess}>
          <FormattedMessage id="show_less" />
        </Link>
      )}
    </div>
  );
}
