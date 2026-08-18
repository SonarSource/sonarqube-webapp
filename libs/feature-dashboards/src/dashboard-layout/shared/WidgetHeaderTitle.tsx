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

import { Heading, HeadingSize, Tooltip } from '@sonarsource/echoes-react';
import { useRef } from 'react';
import { useIntl } from 'react-intl';
import { getWidgetTitleId, useOptionalWidgetInstanceContext } from './WidgetInstanceContext';
import { useObserveElementTruncation } from './hooks/useObserveElementTruncation';
import { getSentenceCaseWidgetTitle } from './widgetTitleSentenceCase';

export interface WidgetHeaderTitleProps {
  title: string;
}

/** Dashboard widget title row: truncates with ellipsis when narrow; full title in tooltip when truncated. */
export function WidgetHeaderTitle({ title }: Readonly<WidgetHeaderTitleProps>) {
  const { locale } = useIntl();
  const sentenceCaseTitle = getSentenceCaseWidgetTitle(title, locale);
  const textRef = useRef<HTMLSpanElement>(null);
  const isTruncated = useObserveElementTruncation(textRef, sentenceCaseTitle);
  const widgetKey = useOptionalWidgetInstanceContext()?.widgetKey;

  const heading = (
    <Heading
      as="h3"
      className="sw-min-w-0 sw-w-full"
      id={widgetKey ? getWidgetTitleId(widgetKey) : undefined}
      size={HeadingSize.Small}
    >
      <span
        className="sw-block sw-truncate sw-text-start"
        ref={textRef}
        {...(isTruncated ? { 'aria-label': sentenceCaseTitle } : {})}
      >
        {sentenceCaseTitle}
      </span>
    </Heading>
  );

  return (
    <div className="sw-min-w-0" data-testid="widget-header-title">
      {isTruncated ? (
        <Tooltip content={sentenceCaseTitle} delayDuration={300}>
          {heading}
        </Tooltip>
      ) : (
        heading
      )}
    </div>
  );
}
