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

import styled from '@emotion/styled';
import { cssVar, Divider, Text } from '@sonarsource/echoes-react';
import { useLayoutEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import tw from 'twin.macro';
import { QualityGateIndicator } from '~adapters/components/ui/QualityGateIndicator';
import { Release } from '../types';

interface Props {
  releases: Release[];
}

export function ReleaseTimeline(props: Readonly<Props>) {
  const { releases } = props;
  const { formatDate } = useIntl();
  const listRef = useRef<HTMLOListElement>(null);

  // Start scrolled to the most recent release (right end) — it's the most relevant.
  useLayoutEffect(() => {
    if (listRef.current !== null) {
      listRef.current.scrollLeft = listRef.current.scrollWidth;
    }
  }, [releases]);

  return (
    <TimelineList ref={listRef}>
      {releases.map((release) => (
        <TimelineItem key={release.analysisKey} totalReleases={releases.length}>
          <QualityGateIndicator status={release.isRisky ? 'ERROR' : 'OK'} />

          <VerticalDashedLine />

          <Divider />

          <Text className="sw-mt-2" isHighlighted size="small">
            {release.version}
          </Text>

          <Text isSubtle size="small">
            {formatDate(release.date, { day: 'numeric', month: 'short' })}
          </Text>
        </TimelineItem>
      ))}
    </TimelineList>
  );
}

const TimelineList = styled.ol`
  ${tw`sw-flex sw-overflow-x-auto sw-mt-4`};
  max-width: calc(${cssVar('layout-sizes-max-width-default')} - 5.5rem);
  white-space: nowrap;
`;

const TimelineItem = styled.li<{ totalReleases: number }>`
  ${tw`sw-inline-flex sw-min-w-[100px] sw-flex-col sw-items-center`}
  width: calc(100% / ${(props) => props.totalReleases});
`;

const VerticalDashedLine = styled.div`
  ${tw`sw-mt-1`};
  height: 64px;
  border-left: 1px dashed ${cssVar('color-border-weak')};
`;
