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

import { LinkHighlight, LinkStandalone, ToggleTip } from '@sonarsource/echoes-react';
import type { MouseEvent } from 'react';
import { FormattedMessage } from 'react-intl';
import { isDefined } from '~shared/helpers/types';

export interface Props {
  failingCount?: number;
  onShowFailing: (e: MouseEvent<HTMLElement>) => void;
}

export default function StatStillFailing({ failingCount, onShowFailing }: Readonly<Props>) {
  if (!isDefined(failingCount)) {
    return undefined;
  }

  return (
    <div className="sw-flex sw-items-center">
      {failingCount > 0 ? (
        <LinkStandalone
          className="sw-typo-lg-semibold sw-align-baseline"
          highlight={LinkHighlight.Accent}
          onClick={onShowFailing}
          to="#"
        >
          {failingCount}
        </LinkStandalone>
      ) : (
        <span className="sw-typo-lg-semibold">{failingCount}</span>
      )}
      <span className="sw-ml-1">
        <FormattedMessage id="background_tasks.failures" />
      </span>

      <ToggleTip
        className="sw-ml-1"
        description={<FormattedMessage id="background_tasks.failing_count" />}
      />
    </div>
  );
}
