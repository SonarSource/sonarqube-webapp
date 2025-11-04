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

import { HelperHintIcon } from '~design-system';
import { translate } from '~sq-server-commons/helpers/l10n';
import HelpTooltip from '~sq-server-commons/sonar-aligned/components/controls/HelpTooltip';
import { formatMeasure } from '~sq-server-commons/sonar-aligned/helpers/measures';

// Do not display the pending time for values smaller than this threshold (in ms)
const MIN_PENDING_TIME_THRESHOLD = 1000;

export interface Props {
  pendingCount?: number;
  pendingTime?: number;
}

export default function StatPendingTime({ pendingCount, pendingTime }: Readonly<Props>) {
  if (!pendingTime || !pendingCount || pendingTime < MIN_PENDING_TIME_THRESHOLD) {
    return null;
  }
  return (
    <div className="sw-flex sw-items-center">
      <span className="sw-typo-lg-semibold sw-mr-1">{formatMeasure(pendingTime, 'MILLISEC')}</span>
      {translate('background_tasks.pending_time')}
      <HelpTooltip
        className="sw-ml-1"
        overlay={translate('background_tasks.pending_time.description')}
      >
        <HelperHintIcon />
      </HelpTooltip>
    </div>
  );
}
