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

import { getSentenceCaseWidgetTitle } from '../widgetTitleSentenceCase';

describe('getSentenceCaseWidgetTitle', () => {
  it('converts an English title to sentence case and preserves acronyms', () => {
    expect(getSentenceCaseWidgetTitle('Blocker Security MTTR for Issues')).toBe(
      'Blocker security MTTR for issues',
    );
  });

  it('preserves mixed-case names', () => {
    expect(getSentenceCaseWidgetTitle('Top SonarQube Projects by Issues', 'en-US')).toBe(
      'Top SonarQube projects by issues',
    );
  });

  it('leaves titles in other locales unchanged', () => {
    expect(getSentenceCaseWidgetTitle('Top SonarQube Projekte nach Problemen', 'de')).toBe(
      'Top SonarQube Projekte nach Problemen',
    );
  });
});
