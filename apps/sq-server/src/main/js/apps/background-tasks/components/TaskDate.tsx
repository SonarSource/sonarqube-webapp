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

import { Text } from '@sonarsource/echoes-react';
import { differenceInDays } from 'date-fns';
import { NumericalCell } from '~design-system';
import TimeFormatter from '~shared/components/intl/TimeFormatter';
import { isValidDate, parseDate } from '~sq-server-commons/helpers/dates';

interface Props {
  baseDate?: string;
  date?: string;
}

export default function TaskDate({ date, baseDate }: Readonly<Props>) {
  const parsedDate = date !== undefined && parseDate(date);
  const parsedBaseDate = baseDate !== undefined && parseDate(baseDate);
  const diff =
    parsedDate && parsedBaseDate && isValidDate(parsedDate) && isValidDate(parsedBaseDate)
      ? differenceInDays(parsedDate, parsedBaseDate)
      : 0;

  return (
    <NumericalCell className="sw-px-2">
      {diff > 0 && (
        <Text className="sw-mr-1" colorOverride="echoes-color-text-warning">{`(+${diff}d)`}</Text>
      )}

      {parsedDate && isValidDate(parsedDate) ? (
        <span className="sw-whitespace-nowrap">
          <TimeFormatter date={parsedDate} long />
        </span>
      ) : (
        ''
      )}
    </NumericalCell>
  );
}
