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

import * as React from 'react';
import { HelperHintIcon } from '~design-system';
import DateFromNow from '~shared/components/intl/DateFromNow';
import { translateWithParameters } from '~sq-server-commons/helpers/l10n';
import HelpTooltip from '~sq-server-commons/sonar-aligned/components/controls/HelpTooltip';
import { ApplicationPeriod } from '~sq-server-commons/types/application';

export interface ApplicationLeakPeriodInfoProps {
  leakPeriod: ApplicationPeriod;
}

export function ApplicationLeakPeriodInfo({ leakPeriod }: ApplicationLeakPeriodInfoProps) {
  return (
    <>
      <DateFromNow date={leakPeriod.date}>
        {(fromNow) => translateWithParameters('overview.started_x', fromNow)}
      </DateFromNow>
      <HelpTooltip
        className="sw-ml-1"
        overlay={translateWithParameters(
          'overview.max_new_code_period_from_x',
          leakPeriod.projectName,
        )}
      >
        <HelperHintIcon />
      </HelpTooltip>
    </>
  );
}

export default React.memo(ApplicationLeakPeriodInfo);
