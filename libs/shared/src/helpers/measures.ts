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

import { getCurrentLocale } from '~adapters/helpers/l10n';
import { isDefined } from '../helpers/types';
import { DNA_SUPPORTED_LANGUAGES } from '../types/architecture';
import { Measure } from '../types/measures';

export function getPrimaryLanguage(measures: Measure[]) {
  const activeLanguage = measures
    ?.flatMap((measure) =>
      measure.value?.split(';').map((pair) => {
        const [language, count] = pair.split('=');
        return { language, count: parseInt(count, 10) };
      }),
    )
    .filter(isDefined)
    .filter(({ language }) => DNA_SUPPORTED_LANGUAGES.includes(language))
    .sort((a, b) => b.count - a.count)
    .map(({ language }) => language)[0];

  return activeLanguage;
}

export function numberFormatter(
  value: string | number,
  minimumFractionDigits = 0,
  maximumFractionDigits = minimumFractionDigits,
) {
  const { format } = new Intl.NumberFormat(getCurrentLocale(), {
    minimumFractionDigits,
    maximumFractionDigits,
  });
  if (typeof value === 'string') {
    return format(parseFloat(value));
  }
  return format(value);
}
