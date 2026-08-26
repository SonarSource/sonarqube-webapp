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

import type { PieChartSegment } from '../../types/visualization';
import { PortfolioDrilldownSliceFilterCard } from '../portfolio-drilldown/PortfolioDrilldownSliceFilterCard';

export interface TopListDrilldownSliceFilterCardProps {
  onRuleChange: (ruleKey: string) => void;
  segments: PieChartSegment[];
  selectedRuleKey?: string;
}

export function TopListDrilldownSliceFilterCard(
  props: Readonly<TopListDrilldownSliceFilterCardProps>,
) {
  const { onRuleChange, segments, selectedRuleKey } = props;

  return (
    <PortfolioDrilldownSliceFilterCard
      descriptionMessageId="portfolio_dashboard.breakdown.viewing_filter.description"
      onSegmentChange={(ruleKey) => {
        if (ruleKey !== undefined) {
          onRuleChange(ruleKey);
        }
      }}
      segments={segments}
      selectedSegmentValue={selectedRuleKey}
      sliceDimensionMessageId="dashboard.top_list.column.rank_by.rule"
    />
  );
}
