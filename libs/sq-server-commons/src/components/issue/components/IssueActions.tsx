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

import { ButtonVariety } from '@sonarsource/echoes-react';
import { noop } from 'lodash';
import React, { useContext } from 'react';
import { IssuePopupContext, IssuePopupName } from '~shared/components/issues/IssuePopupContext';
import { HighlightRing } from '../../../design-system/components/HighlightRing';
import { Issue } from '../../../types/types';
import IssueTransition from './IssueTransition';
import SonarLintBadge from './SonarLintBadge';

interface Props {
  issue: Issue;
  onChange: (issue: Issue) => void;
  additionalIssueActions?: React.ComponentType<{ issue: Issue; variety?: ButtonVariety }>[];
}

export function IssueActions(props: Readonly<Props>) {
  const { issue, onChange, additionalIssueActions } = props;
  const popupContext = useContext(IssuePopupContext);
  const currentPopup = popupContext?.currentPopup;
  const togglePopup = popupContext?.togglePopup ?? noop;

  return (
    <>
      <HighlightRing className="sw-relative" data-guiding-id={`issue-transition-${issue.key}`}>
        <IssueTransition
          isOpen={currentPopup === IssuePopupName.Transition}
          issue={issue}
          onChange={onChange}
          togglePopup={togglePopup}
          variety={ButtonVariety.Default}
        />
      </HighlightRing>
      {issue.quickFixAvailable && <SonarLintBadge variant="button" />}
      {additionalIssueActions?.map((ActionComponent, index) => (
        <ActionComponent
          issue={issue}
          key={`${index}-${issue.key}`}
          variety={ButtonVariety.Default}
        />
      ))}
    </>
  );
}
