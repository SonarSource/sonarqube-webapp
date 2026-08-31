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

import { ToggleTip } from '@sonarsource/echoes-react';
import { memo } from 'react';
import { useIntl } from 'react-intl';
import DateFromNow from '~shared/components/intl/DateFromNow';
import { ApplicationPeriod } from '~sq-server-commons/types/application';

export interface ApplicationLeakPeriodInfoProps {
  leakPeriod: ApplicationPeriod;
}

export function ApplicationLeakPeriodInfo({ leakPeriod }: ApplicationLeakPeriodInfoProps) {
  const { formatMessage } = useIntl();

  return (
    <>
      <DateFromNow date={leakPeriod.date}>
        {(fromNow) => formatMessage({ id: 'overview.started_x' }, { 0: fromNow })}
      </DateFromNow>

      <ToggleTip
        className="sw-ml-1"
        description={formatMessage(
          { id: 'overview.max_new_code_period_from_x' },
          { 0: leakPeriod.projectName },
        )}
      />
    </>
  );
}

export default memo(ApplicationLeakPeriodInfo);
