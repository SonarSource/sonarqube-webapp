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

import { screen } from '@testing-library/react';
import { RuleDescriptionSections } from '~shared/types/rules';
import { renderComponent } from '../../../helpers/testReactTestingUtils';
import MoreInfoRuleDescription from '../MoreInfoRuleDescription';
import RuleDescription from '../RuleDescription';

const SECTIONS = [
  {
    key: RuleDescriptionSections.RootCause,
    content: '<h3>Impact</h3><h4>Detail</h4><pre>code</pre>',
  },
];

function headingLevels() {
  return screen
    .getAllByRole('heading')
    .map((heading) => [heading.textContent, heading.getAttribute('aria-level')]);
}

describe('RuleDescription', () => {
  it('keeps the heading levels of the description by default', () => {
    renderComponent(<RuleDescription sections={SECTIONS} />);

    expect(screen.getByRole('heading', { name: 'Impact', level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Detail', level: 4 })).toBeInTheDocument();
  });

  it('lowers the headings of the description below the minimum level', () => {
    renderComponent(<RuleDescription minHeadingLevel={4} sections={SECTIONS} />);

    expect(screen.getByRole('heading', { name: 'Impact', level: 4 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Detail', level: 5 })).toBeInTheDocument();
  });

  it('lowers its own context headings along with the description headings', () => {
    renderComponent(
      <RuleDescription
        minHeadingLevel={4}
        sections={[
          {
            key: RuleDescriptionSections.HowToFix,
            content: '<h3>Fix</h3>',
            context: { displayName: 'Spring', key: 'spring' },
          },
        ]}
      />,
    );

    const levels = screen
      .getAllByRole('heading')
      .map((heading) => heading.getAttribute('aria-level'));

    expect(levels[0]).toBe('4');
    expect(screen.getByRole('heading', { name: 'Fix', level: 5 })).toBeInTheDocument();
  });
});

describe('MoreInfoRuleDescription', () => {
  const resources = [
    { key: RuleDescriptionSections.Resources, content: '<h2>Documentation</h2><h3>Links</h3>' },
  ];

  it('keeps the legacy heading levels by default', () => {
    renderComponent(
      <MoreInfoRuleDescription educationPrinciples={['defense_in_depth']} sections={resources} />,
    );

    expect(headingLevels().map(([, level]) => level)).toEqual([null, null, null, null, null]);
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3);
  });

  it('exposes the titles and all contents below the minimum level', () => {
    renderComponent(
      <MoreInfoRuleDescription
        educationPrinciples={['defense_in_depth']}
        minHeadingLevel={4}
        sections={resources}
      />,
    );

    expect(headingLevels()).toEqual([
      ['coding_rules.more_info.resources.title', '4'],
      ['Documentation', '5'],
      ['Links', '6'],
      ['coding_rules.more_info.education_principles.title', '4'],
      ['Defense-in-depth', '5'],
    ]);
  });
});
