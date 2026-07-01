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

import { Card, Text, TextSize } from '@sonarsource/echoes-react';
import { ReactNode } from 'react';
import { OnboardingProgressDonut } from './progress/OnboardingProgressDonut';

interface Props {
  /** Subtle one-line caption shown under the title. */
  description?: ReactNode;
  /** When set, a compact ring is rendered next to the primary value, colored by this percentage. */
  donutPercent?: number;
  /** The most salient value for the card (a count or a percentage). */
  primaryValue: ReactNode;
  /** Already-translated card title, shown under the primary value. */
  title: string;
}

/**
 * Compact metric card: a headline value (optionally paired with a progress ring), a title and a
 * subtle description. Used for the row of summary cards at the top of the onboarding dashboard.
 */
export function StatCard({ description, donutPercent, primaryValue, title }: Readonly<Props>) {
  return (
    <Card className="sw-min-w-0">
      <Card.Body>
        <div className="sw-flex sw-flex-col sw-gap-1">
          <div className="sw-flex sw-items-center sw-gap-2">
            {donutPercent !== undefined && (
              <OnboardingProgressDonut size={28} thickness={5} value={donutPercent} />
            )}
            <Text isHighlighted size={TextSize.Large}>
              {primaryValue}
            </Text>
          </div>

          <Text isHighlighted>{title}</Text>

          {description !== undefined && (
            <Text isSubtle size={TextSize.Small}>
              {description}
            </Text>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
