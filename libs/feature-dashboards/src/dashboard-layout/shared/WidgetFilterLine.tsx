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

import { Text, TextSize, Tooltip } from '@sonarsource/echoes-react';
import { useRef } from 'react';
import { useObserveElementTruncation } from './hooks/useObserveElementTruncation';

const FILTER_LINE_SEPARATOR = ' · ';

export interface WidgetFilterLineProps {
  className?: string;
  segments: ReadonlyArray<string>;
}

export function WidgetFilterLine({ className, segments }: Readonly<WidgetFilterLineProps>) {
  const textRef = useRef<HTMLSpanElement>(null);
  const fullText = segments.join(FILTER_LINE_SEPARATOR);
  const isTruncated = useObserveElementTruncation(textRef, fullText);

  if (segments.length === 0) {
    return null;
  }

  const baseLineClassName = 'sw-w-full sw-min-w-0 sw-truncate sw-text-start';
  const lineClassName = className ? `${baseLineClassName} ${className}` : baseLineClassName;

  const line = (
    <Text
      as="div"
      className={lineClassName}
      isSubtle
      ref={textRef}
      size={TextSize.Small}
      {...(isTruncated ? { 'aria-label': fullText } : {})}
    >
      {fullText}
    </Text>
  );

  if (!isTruncated) {
    return (
      <div className="sw-w-full sw-min-w-0" data-testid="widget-filter-line">
        {line}
      </div>
    );
  }

  return (
    <div className="sw-w-full sw-min-w-0" data-testid="widget-filter-line">
      <Tooltip content={fullText} delayDuration={300}>
        {line}
      </Tooltip>
    </div>
  );
}
