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
import { cssVar } from '@sonarsource/echoes-react';
import * as React from 'react';
import { BareButton, SubnavigationItem, themeContrast } from '~design-system';
import { IssueMessageHighlighting } from '~shared/components/issues/IssueMessageHighlighting';
import { Issue } from '~sq-server-commons/types/types';
import IssueItemLocationsQuantity from './IssueItemLocationsQuantity';
import IssueLocationsNavigator from './IssueLocationsNavigator';

export interface ConciseIssueProps {
  issue: Issue;
  onClick: (issueKey: string) => void;
  onFlowSelect: (index?: number) => void;
  onLocationSelect: (index: number) => void;
  selected: boolean;
  selectedFlowIndex: number | undefined;
  selectedLocationIndex: number | undefined;
}

export default function SubnavigationIssue(props: ConciseIssueProps) {
  const { issue, selected, selectedFlowIndex, selectedLocationIndex } = props;
  const element = React.useRef<HTMLLIElement>(null);

  React.useEffect(() => {
    if (selected) {
      element.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [selected]);

  return (
    <li ref={element}>
      <SubnavigationItem active={selected} onClick={props.onClick} value={issue.key}>
        <div className="sw-w-full">
          <BareButton aria-current={selected} className="sw-mb-2 sw-break-words sw-p-1">
            <IssueMessageHighlighting
              message={issue.message}
              messageFormattings={issue.messageFormattings}
            />
          </BareButton>
          <IssueInfo className="sw-flex sw-justify-between sw-gap-2">
            <IssueItemLocationsQuantity issue={issue} />
          </IssueInfo>
          {selected && (
            <IssueLocationsNavigator
              issue={issue}
              onFlowSelect={props.onFlowSelect}
              onLocationSelect={props.onLocationSelect}
              selectedFlowIndex={selectedFlowIndex}
              selectedLocationIndex={selectedLocationIndex}
            />
          )}
        </div>
      </SubnavigationItem>
    </li>
  );
}

const IssueInfo = styled.div`
  color: ${cssVar('color-text-subtle')};

  .active &,
  :hover & {
    color: ${themeContrast('subnavigation')};
  }
`;
