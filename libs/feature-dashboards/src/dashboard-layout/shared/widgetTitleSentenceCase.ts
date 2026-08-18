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

const WORD_PATTERN = /\p{L}[\p{L}\p{M}]*/gu;

/**
 * Converts English widget titles to sentence case while preserving acronyms and mixed-case names.
 * Other locales are left to their translations because their capitalization rules may differ.
 */
export function getSentenceCaseWidgetTitle(title: string, locale = 'en'): string {
  if (!locale.toLowerCase().startsWith('en')) {
    return title;
  }

  let isFirstWord = true;

  return title.replace(WORD_PATTERN, (word) => {
    if (isFirstWord) {
      isFirstWord = false;
      return word;
    }

    const wordWithoutFirstLetter = word.slice(1);
    const hasInternalUppercase =
      wordWithoutFirstLetter !== wordWithoutFirstLetter.toLocaleLowerCase(locale);

    return hasInternalUppercase ? word : word.toLocaleLowerCase(locale);
  });
}
