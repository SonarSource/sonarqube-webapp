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

import { MarginIndicator, MarginIndicatorType } from '@sonarsource/echoes-react';
import React, { memo } from 'react';
import { LineMeta } from './LineStyles';

type CoverageStatus = 'uncovered' | 'partially-covered' | 'covered';

interface Props {
  coverageStatus?: CoverageStatus;
  lineNumber: number;
  scrollToUncoveredLine?: boolean;
  status: string | undefined;
}

const COVERAGE_STATUS_MAPPING: Record<CoverageStatus, MarginIndicatorType> = {
  'partially-covered': MarginIndicatorType.PartiallyCovered,
  covered: MarginIndicatorType.Covered,
  uncovered: MarginIndicatorType.UnCovered,
};

function LineCoverageFunc({
  lineNumber,
  coverageStatus,
  status,
  scrollToUncoveredLine,
}: Readonly<Props>) {
  const coverageMarker = React.useRef<HTMLTableCellElement>(null);
  React.useEffect(() => {
    if (scrollToUncoveredLine && coverageMarker.current) {
      coverageMarker.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [scrollToUncoveredLine, coverageMarker]);

  if (!coverageStatus) {
    return <LineMeta data-line-number={lineNumber} />;
  }

  return (
    <LineMeta className="sw-pl-1/2" data-line-number={lineNumber} ref={coverageMarker}>
      <MarginIndicator
        ariaLabel={status ?? ''}
        indicatorType={COVERAGE_STATUS_MAPPING[coverageStatus]}
      />
    </LineMeta>
  );
}

export const LineCoverage = memo(LineCoverageFunc);
