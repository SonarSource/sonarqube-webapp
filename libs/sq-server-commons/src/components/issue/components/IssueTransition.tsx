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

import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { StatusTransition } from '~shared/components/status-transition/StatusTransition';
import { useIssueCommentMutation, useIssueTransitionMutation } from '../../../queries/issues';
import { IssueStatus } from '../../../types/issues';
import { Issue } from '../../../types/types';
import { updateIssue } from '../actions';
import {
  isTransitionDeprecated,
  isTransitionVisible,
  orderIssueTransitions,
  transitionRequiresComment,
} from '../helpers';

interface Props {
  isOpen: boolean;
  issue: Pick<Issue, 'key' | 'resolution' | 'issueStatus' | 'transitions' | 'type' | 'actions'>;
  onChange: (issue: Issue) => void;
  togglePopup: (popup: string, show?: boolean) => void;
}

export default function IssueTransition(props: Readonly<Props>) {
  const intl = useIntl();
  const { isOpen, issue, onChange, togglePopup } = props;

  const [transitioning, setTransitioning] = React.useState(false);
  const { mutateAsync: setIssueTransition } = useIssueTransitionMutation();
  const { mutateAsync: addIssueComment } = useIssueCommentMutation();

  const changeIssueStatus = React.useCallback(
    async (transition: string, comment?: string) => {
      setTransitioning(true);

      try {
        if (typeof comment === 'string' && comment.length > 0) {
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
    [issue.key, onChange, addIssueComment, setIssueTransition, togglePopup],
  );

  const transitions = orderIssueTransitions(issue.transitions.filter(isTransitionVisible)).map(
    (transition) => ({
      value: transition,
      isDeprecated: isTransitionDeprecated(transition),
      requiresComment: transitionRequiresComment(transition),
    }),
  );

  const getTooltipContent = () => {
    if (issue.issueStatus === IssueStatus.InSandbox) {
      return <FormattedMessage id="issue.transition.status_in_sandbox" />;
    }

    if ([IssueStatus.Confirmed, IssueStatus.Fixed].includes(issue.issueStatus)) {
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
    />
  );
}
