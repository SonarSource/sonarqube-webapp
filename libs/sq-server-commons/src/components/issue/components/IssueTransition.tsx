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
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { StatusTransition } from '~shared/components/status-transition/StatusTransition';
import {
  isTransitionVisible,
  orderIssueTransitions,
  transitionRequiresComment,
} from '~shared/helpers/issues';
import { isInput, isShortcut } from '../../../helpers/keyboardEventHelpers';
import { KeyboardKeys } from '../../../helpers/keycodes';
import { getKeyboardShortcutEnabled } from '../../../helpers/preferences';
import { useIssueCommentMutation, useIssueTransitionMutation } from '../../../queries/issues';
import { IssueActions, IssueStatus } from '../../../types/issues';
import { Issue } from '../../../types/types';
import { updateIssue } from '../actions';

interface Props {
  isOpen: boolean;
  isSelected?: boolean;
  issue: Pick<Issue, 'key' | 'resolution' | 'issueStatus' | 'transitions' | 'type' | 'actions'>;
  onChange: (issue: Issue) => void;
  togglePopup: (popup: string, show?: boolean) => void;
  variety?: ButtonVariety;
}

export default function IssueTransition(props: Readonly<Props>) {
  const intl = useIntl();
  const { isOpen, isSelected = true, issue, onChange, togglePopup, variety } = props;

  const canComment = issue.actions.includes(IssueActions.Comment);

  const [transitioning, setTransitioning] = React.useState(false);
  const { mutateAsync: setIssueTransition } = useIssueTransitionMutation();
  const { mutateAsync: addIssueComment } = useIssueCommentMutation();

  const changeIssueStatus = React.useCallback(
    async (transition: string, comment?: string) => {
      setTransitioning(true);

      try {
        if (canComment && typeof comment === 'string' && comment.length > 0) {
          await setIssueTransition({ issue: issue.key, transition });
          await updateIssue(onChange, addIssueComment({ issue: issue.key, text: comment }));
        } else {
          await updateIssue(onChange, setIssueTransition({ issue: issue.key, transition }));
        }
        togglePopup('transition', false);
      } finally {
        setTransitioning(false);
      }
    },
    [canComment, issue.key, onChange, addIssueComment, setIssueTransition, togglePopup],
  );

  const transitions = orderIssueTransitions(issue.transitions.filter(isTransitionVisible)).map(
    (transition) => ({
      value: transition,
      requiresComment: transitionRequiresComment(transition),
    }),
  );

  const canTransition = transitions.length > 0;

  const handleKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (isInput(event) || isShortcut(event) || !getKeyboardShortcutEnabled()) {
        return;
      }
      if (event.key === KeyboardKeys.KeyF) {
        event.preventDefault();
        togglePopup('transition');
      }
    },
    [togglePopup],
  );

  React.useEffect(() => {
    if (isSelected && canTransition) {
      document.addEventListener('keydown', handleKeyDown, { capture: true });
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [canTransition, handleKeyDown, isSelected]);

  const getTooltipContent = () => {
    if (issue.issueStatus === IssueStatus.InSandbox) {
      return <FormattedMessage id="issue.transition.status_in_sandbox" />;
    }

    if (issue.issueStatus === IssueStatus.Fixed) {
      return <FormattedMessage id="issue.transition.status_deprecated" />;
    }

    return <FormattedMessage id="issue.transition.status" />;
  };

  return (
    <StatusTransition
      buttonTooltipContent={getTooltipContent()}
      dropdownHeader={{
        label: <FormattedMessage id="issue.transition.title" />,
        helpText:
          issue.issueStatus === IssueStatus.InSandbox ? (
            <FormattedMessage id="issue.transition.in_sandbox_helptext" />
          ) : null,
      }}
      isOpen={isOpen}
      isTransiting={transitioning}
      onOpenChange={(isOpen) => {
        togglePopup('transition', isOpen);
      }}
      onTransition={changeIssueStatus}
      status={intl.formatMessage({ id: `issue.issue_status.${issue.issueStatus}` })}
      transitions={transitions}
      variety={variety}
    />
  );
}
