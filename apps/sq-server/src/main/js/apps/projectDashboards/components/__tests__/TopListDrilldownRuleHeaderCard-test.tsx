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
import { TopListDrilldownRuleHeaderCard } from '~feature-dashboards/components/top-list-drilldown/TopListDrilldownRuleHeaderCard';
import { renderWithRouter } from '~shared/helpers/test-utils';

describe('TopListDrilldownRuleHeaderCard', () => {
  it('links to the Server rules page without an organization', () => {
    renderWithRouter(<TopListDrilldownRuleHeaderCard ruleKey="java:S999" />);

    const href = screen
      .getByRole('link', {
        name: 'portfolio_dashboard.breakdown.top_list.rule_details.view_rule',
      })
      .getAttribute('href');

    expect(href).toContain('/coding_rules?');
    expect(href).toContain('rule_key=java%3AS999');
    expect(href).not.toContain('/organizations/');
  });
});
