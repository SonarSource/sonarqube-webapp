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

interface DashboardDownloadMetadata {
  id: string;
  name: string;
}

/**
 * Sanitizes a dashboard name for use as a download filename.
 * Strips control characters and Windows-illegal characters, then normalizes
 * whitespace/hyphens. Preserves Unicode letters and digits.
 */
export function sanitizeDashboardFilename(name: string): string {
  // Whitespace is normalized first so tabs/newlines become hyphens instead of being dropped as control characters.
  return [...name.replaceAll(/\s+/g, '-')]
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return (
        codePoint > 0x1f &&
        (codePoint < 0x7f || codePoint > 0x9f) &&
        !/[\\/:*?"<>|]/.test(character)
      );
    })
    .join('')
    .replaceAll(/-+/g, '-')
    .replaceAll(/(^-)|(-$)/g, '');
}

export function downloadDashboardSchema<T extends DashboardDownloadMetadata>(dashboard: T): void {
  const jsonString = JSON.stringify(dashboard, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const filename = `${sanitizeDashboardFilename(dashboard.name)}-${dashboard.id}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
    link.remove();
  }, 0);
}
