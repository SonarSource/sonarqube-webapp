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
import { FormatDateOptions, FormattedDate } from 'react-intl';

export interface DateFormatterProps {
  children?: (formattedDate: string) => React.ReactNode;
  date: string | number | Date;
  long?: boolean;
  useUtc?: boolean;
}

export const formatterOption: FormatDateOptions = {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
};

export const longFormatterOption: FormatDateOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

export default function DateFormatter(props: Readonly<DateFormatterProps>) {
  const { children, date, long, useUtc = false } = props;
  const formatterOptions = long ? longFormatterOption : formatterOption;
  const options = { ...formatterOptions, timeZone: useUtc ? 'utc' : undefined };

  return (
    <FormattedDate value={date} {...options}>
      {children ? (d) => <>{children(d)}</> : undefined}
    </FormattedDate>
  );
}
