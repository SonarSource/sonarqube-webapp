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

import { mockIssue } from '../../../../helpers/testMocks';
import { renderComponent } from '../../../../helpers/testReactTestingUtils';
import { hasIssueBadges, IssueBadges } from '../IssueBadges';

describe('hasIssueBadges', () => {
  it('is false when there are no code variants and the rule is not prioritized', () => {
    expect(hasIssueBadges(mockIssue(false, { codeVariants: [], prioritizedRule: false }))).toBe(
      false,
    );
  });

  it('is true when the issue has code variants', () => {
    expect(hasIssueBadges(mockIssue(false, { codeVariants: ['v1'] }))).toBe(true);
  });

  it('is true when the rule is prioritized', () => {
    expect(hasIssueBadges(mockIssue(false, { prioritizedRule: true }))).toBe(true);
  });
});

describe('IssueBadges', () => {
  it('renders nothing when there are no badges', () => {
    const { container } = renderComponent(
      <IssueBadges issue={mockIssue(false, { codeVariants: [], prioritizedRule: false })} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders code variants', () => {
    const { container } = renderComponent(
      <IssueBadges issue={mockIssue(false, { codeVariants: ['variant-a'] })} />,
    );

    expect(container).toHaveTextContent('variant-a');
  });
});
