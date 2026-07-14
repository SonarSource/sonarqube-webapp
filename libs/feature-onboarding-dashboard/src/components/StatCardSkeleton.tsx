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

import { Card, LoadingSkeleton, Text, TextSize } from '@sonarsource/echoes-react';

/**
 * Loading placeholder mirroring {@link StatCard}: a headline value, a title and a subtle
 * description, rendered as text skeletons inside the same card chrome. `isLoading` is read from
 * the enclosing LoadingContainer context.
 */
export function StatCardSkeleton() {
  return (
    <Card className="sw-min-w-0">
      <Card.Body>
        <div className="sw-flex sw-flex-col sw-gap-1">
          <Text isHighlighted size={TextSize.Large}>
            <LoadingSkeleton className="sw-w-16" variety="text" />
          </Text>

          <Text isHighlighted>
            <LoadingSkeleton className="sw-w-32" variety="text" />
          </Text>

          <Text isSubtle size={TextSize.Small}>
            <LoadingSkeleton className="sw-w-40" variety="text" />
          </Text>
        </div>
      </Card.Body>
    </Card>
  );
}
