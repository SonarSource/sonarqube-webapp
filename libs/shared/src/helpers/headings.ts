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

const HEADING_SELECTOR = 'h1,h2,h3,h4,h5,h6';
const MAX_HEADING_LEVEL = 6;

// The issue title is an h3, so headings inside the issue tab panels must sit below it.
export const ISSUE_TAB_MIN_HEADING_LEVEL = 4;

/**
 * Exposes every heading inside `element` to assistive technologies at a level of at least
 * `minLevel` (no-op when undefined), keeping the relative structure of the headings (clamped at h6). Only `aria-level` is
 * set, so the heading elements and their tag-based styling are left untouched.
 *
 * This runs on a rendered container (usually from a `ref` callback) instead of passing `aria-level`
 * to each heading in JSX because most of these headings live in HTML strings coming from the
 * backend (rule descriptions), which we render as-is and cannot add props to.
 */
export function enforceMinHeadingLevel(element: Element | null, minLevel: number | undefined) {
  if (element === null || minLevel === undefined) {
    return;
  }

  const headings = Array.from(element.querySelectorAll(HEADING_SELECTOR), (heading) => ({
    heading,
    level: Number(heading.tagName.charAt(1)),
  }));
  const shift = minLevel - Math.min(...headings.map(({ level }) => level));

  if (shift <= 0) {
    return;
  }

  headings.forEach(({ heading, level }) => {
    heading.setAttribute('aria-level', String(Math.min(level + shift, MAX_HEADING_LEVEL)));
  });
}
