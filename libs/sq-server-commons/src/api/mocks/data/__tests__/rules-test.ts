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

import { RuleDescriptionSection, RuleDescriptionSections } from '~shared/types/rules';
import { filterDescriptionSectionsByContextKey } from '../rules';

const NO_CONTEXT_SECTION: RuleDescriptionSection = {
  key: RuleDescriptionSections.RootCause,
  content: 'root cause',
};
const SPRING_SECTION: RuleDescriptionSection = {
  key: RuleDescriptionSections.HowToFix,
  content: 'spring content',
  context: { key: 'spring', displayName: 'Spring' },
};
const OTHER_SECTION: RuleDescriptionSection = {
  key: RuleDescriptionSections.HowToFix,
  content: 'other content',
  context: { key: 'other', displayName: 'Other' },
};

const SECTIONS = [NO_CONTEXT_SECTION, SPRING_SECTION, OTHER_SECTION];

describe('filterDescriptionSectionsByContextKey', () => {
  it('returns every section unfiltered when no contextKey is provided', () => {
    expect(filterDescriptionSectionsByContextKey(SECTIONS, undefined)).toEqual(SECTIONS);
  });

  it("keeps only the context-less sections when contextKey is the string 'null'", () => {
    expect(filterDescriptionSectionsByContextKey(SECTIONS, 'null')).toEqual([NO_CONTEXT_SECTION]);
  });

  it('keeps the context-less sections plus the section matching a real contextKey', () => {
    expect(filterDescriptionSectionsByContextKey(SECTIONS, 'spring')).toEqual([
      NO_CONTEXT_SECTION,
      SPRING_SECTION,
    ]);
  });

  it('returns undefined when sections is undefined', () => {
    expect(filterDescriptionSectionsByContextKey(undefined, 'spring')).toBeUndefined();
  });
});
