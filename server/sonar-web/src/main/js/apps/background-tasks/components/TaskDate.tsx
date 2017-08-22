/*
 * SonarQube
 * Copyright (C) 2009-2017 SonarSource SA
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
import TimeFormatter from '../../../components/intl/TimeFormatter';
import { differenceInDays, isValidDate, parseDate } from '../../../helpers/dates';

interface Props {
  date: string;
  baseDate: string;
}

export default function TaskDate({ date, baseDate }: Props) {
  const parsedDate = parseDate(date);
  const parsedBaseDate = parseDate(baseDate);
  const diff =
    date && baseDate && isValidDate(parsedDate) && isValidDate(parsedBaseDate)
      ? differenceInDays(parsedDate, parsedBaseDate)
      : 0;

  return (
    <td className="thin nowrap text-right">
      {diff > 0 && <span className="text-warning little-spacer-right">{`(+${diff}d)`}</span>}

      {date && isValidDate(parsedDate) ? <TimeFormatter date={parsedDate} long={true} /> : ''}
    </td>
  );
}
