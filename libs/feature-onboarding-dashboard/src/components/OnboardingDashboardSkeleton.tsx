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
import { StatCardSkeleton } from './StatCardSkeleton';

const DONUT_SIZE = 'sw-h-[176px] sw-w-[176px]';
const CHART_HEIGHT = 'sw-h-[200px]';

/** Card header placeholder: a title line and a subtle description line. */
function CardHeaderSkeleton() {
  return (
    <Card.Header
      description={<LoadingSkeleton className="sw-w-64" variety="text" />}
      title={<LoadingSkeleton className="sw-w-40" variety="text" />}
    />
  );
}

/** One checklist-item placeholder: status dot, title/description lines and a progress bar. */
function ChecklistRowSkeleton() {
  return (
    <div className="sw-flex sw-flex-col sw-gap-2 sw-py-3">
      <div className="sw-flex sw-items-start sw-gap-3">
        <div className="sw-pt-1">
          <LoadingSkeleton className="sw-h-3 sw-w-3" variety="disk" />
        </div>

        <div className="sw-flex sw-min-w-0 sw-grow sw-flex-col sw-gap-1">
          <Text isHighlighted>
            <LoadingSkeleton className="sw-w-40" variety="text" />
          </Text>
          <Text isSubtle size={TextSize.Small}>
            <LoadingSkeleton className="sw-w-64" variety="text" />
          </Text>
        </div>

        <Text isHighlighted>
          <LoadingSkeleton className="sw-w-10" variety="text" />
        </Text>
      </div>

      <LoadingSkeleton className="sw-h-2 sw-w-full" variety="rectangle" />
    </div>
  );
}

/** One DevOps-platform placeholder row: icon + name, two counts and a share bar. */
function DevopsRowSkeleton() {
  return (
    <div className="sw-flex sw-flex-col sw-gap-2 sw-py-3">
      <div className="sw-flex sw-items-center sw-justify-between">
        <div className="sw-flex sw-shrink-0 sw-items-center sw-gap-2 sw-w-[150px]">
          <LoadingSkeleton className="sw-h-5 sw-w-5" variety="disk" />
          <LoadingSkeleton className="sw-w-24" variety="text" />
        </div>
        <LoadingSkeleton className="sw-w-10" variety="text" />
        <LoadingSkeleton className="sw-w-10" variety="text" />
      </div>

      <LoadingSkeleton className="sw-h-2 sw-w-full" variety="rectangle" />
    </div>
  );
}

/** Donut-chart card placeholder: a disk next to a stack of legend lines. */
function DonutCardSkeleton() {
  return (
    <Card className="sw-min-w-0">
      <CardHeaderSkeleton />
      <Card.Body>
        <div className="sw-flex sw-items-center sw-gap-6">
          <LoadingSkeleton className={`${DONUT_SIZE} sw-shrink-0`} variety="disk" />
          <div className="sw-flex sw-flex-col sw-gap-2 sw-grow">
            {Array.from({ length: 4 }, (_, index) => (
              <LoadingSkeleton className="sw-w-32" key={`legend-${index}`} variety="text" />
            ))}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

interface TableCardSkeletonProps {
  rows?: number;
}

/** Table card placeholder: a search field and a stack of row bars. */
function TableCardSkeleton({ rows = 5 }: Readonly<TableCardSkeletonProps>) {
  return (
    <Card className="sw-min-w-0">
      <CardHeaderSkeleton />
      <Card.Body>
        <div className="sw-flex sw-flex-col sw-gap-4">
          <div className="sw-flex sw-items-center sw-justify-between">
            <LoadingSkeleton className="sw-h-8 sw-w-64" variety="rectangle" />
            <LoadingSkeleton className="sw-w-24" variety="text" />
          </div>
          <div className="sw-flex sw-flex-col sw-gap-3">
            {Array.from({ length: rows }, (_, index) => (
              <LoadingSkeleton
                className="sw-h-8 sw-w-full"
                key={`row-${index}`}
                variety="rectangle"
              />
            ))}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

/**
 * Full-page loading placeholder for the onboarding dashboard overview. Mirrors the real grid so
 * the layout stays stable when data arrives. Meant to render inside a LoadingContainer, from which
 * every skeleton reads its `isLoading` state.
 */
export function OnboardingDashboardSkeleton() {
  return (
    <div className="sw-flex sw-flex-col sw-gap-4">
      <div className="sw-grid sw-grid-cols-4 sw-gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <StatCardSkeleton key={`stat-${index}`} />
        ))}
      </div>

      <Card>
        <Card.Header
          description={<LoadingSkeleton className="sw-w-64" variety="text" />}
          hasDivider
          rightContent={<LoadingSkeleton className="sw-h-6 sw-w-20" variety="rectangle" />}
          title={<LoadingSkeleton className="sw-w-40" variety="text" />}
        />
        <Card.Body>
          <div className="sw-flex sw-flex-col">
            {Array.from({ length: 4 }, (_, index) => (
              <ChecklistRowSkeleton key={`checklist-${index}`} />
            ))}
          </div>
        </Card.Body>
      </Card>

      <div className="sw-grid sw-grid-cols-3 sw-items-start sw-gap-4">
        <div className="sw-col-span-2 sw-h-full">
          <Card className="sw-flex sw-h-full sw-flex-col">
            <CardHeaderSkeleton />
            <Card.Body className="sw-flex sw-grow sw-flex-col">
              <div className="sw-flex sw-flex-col sw-gap-4">
                <Text isHighlighted size={TextSize.Large}>
                  <LoadingSkeleton className="sw-w-48" variety="text" />
                </Text>
                <LoadingSkeleton className={`${CHART_HEIGHT} sw-w-full`} variety="rectangle" />
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="sw-flex sw-flex-col sw-gap-4">
          <DonutCardSkeleton />
          <DonutCardSkeleton />
        </div>
      </div>

      <div className="sw-grid sw-grid-cols-12 sw-items-start sw-gap-4">
        <div className="sw-col-span-7 sw-h-full">
          <TableCardSkeleton rows={4} />
        </div>
        <div className="sw-col-span-5 sw-h-full">
          <Card className="sw-min-w-0">
            <CardHeaderSkeleton />
            <Card.Body>
              <div className="sw-flex sw-flex-col">
                {Array.from({ length: 4 }, (_, index) => (
                  <DevopsRowSkeleton key={`devops-${index}`} />
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <TableCardSkeleton />
    </div>
  );
}
