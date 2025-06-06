/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { IconLink, Link } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { ClipboardIconButton } from '~shared/components/clipboard';
import { IssueMessageHighlighting } from '~shared/components/issues/IssueMessageHighlighting';
import { getBranchLikeQuery } from '~shared/helpers/branch-like';
import { SoftwareImpactSeverity, SoftwareQuality } from '~shared/types/clean-code-taxonomy';
import { RuleDetails } from '~shared/types/rules';
import { setIssueAssignee, setIssueSeverity } from '../../api/issues';
import {
  addGlobalSuccessMessage,
  Badge,
  BasicSeparator,
  Note,
  PageContentFontWrapper,
} from '../../design-system';
import { isInput, isShortcut } from '../../helpers/keyboardEventHelpers';
import { KeyboardKeys } from '../../helpers/keycodes';
import { translate } from '../../helpers/l10n';
import { getKeyboardShortcutEnabled } from '../../helpers/preferences';
import { getPathUrlAsString, getRuleUrl } from '../../helpers/urls';
import { getComponentIssuesUrl } from '../../sonar-aligned/helpers/urls';
import { BranchLike } from '../../types/branch-like';
import { IssueActions, IssueSeverity, IssueType } from '../../types/issues';
import { Issue } from '../../types/types';
import { updateIssue } from '../issue/actions';
import IssueActionsBar from '../issue/components/IssueActionsBar';
import { WorkspaceContext } from '../workspace/context';
import IssueHeaderMeta from './IssueHeaderMeta';
import IssueHeaderSide from './IssueHeaderSide';

interface Props {
  branchLike?: BranchLike;
  issue: Issue;
  onIssueChange: (issue: Issue) => void;
  ruleDetails: RuleDetails;
}

interface State {
  issuePopupName?: string;
}

export default class IssueHeader extends React.PureComponent<Props, State> {
  state = { issuePopupName: undefined };

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown, { capture: true });
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.issue.key !== this.props.issue.key) {
      this.setState({ issuePopupName: undefined });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown, {
      capture: true,
    });
  }

  handleIssuePopupToggle = (popupName: string, open?: boolean) => {
    this.setState(({ issuePopupName }) => {
      const samePopup = popupName && issuePopupName === popupName;
      if (open !== false && !samePopup) {
        return { issuePopupName: popupName };
      } else if (open !== true && samePopup) {
        return { issuePopupName: undefined };
      }
      return { issuePopupName };
    });
  };

  handleAssignement = (login: string) => {
    const { issue } = this.props;
    if (issue.assignee !== login) {
      void updateIssue(
        this.props.onIssueChange,
        // eslint-disable-next-line local-rules/no-api-imports
        setIssueAssignee({ issue: issue.key, assignee: login }),
      );
    }
    this.handleIssuePopupToggle('assign', false);
  };

  handleSeverityChange = (
    severity: IssueSeverity | SoftwareImpactSeverity,
    quality?: SoftwareQuality,
  ) => {
    const { issue } = this.props;

    const data = quality
      ? { issue: issue.key, impact: `${quality}=${severity}` }
      : { issue: issue.key, severity: severity as IssueSeverity };

    const severityBefore = quality
      ? issue.impacts.find((impact) => impact.softwareQuality === quality)?.severity
      : issue.severity;

    return updateIssue(
      this.props.onIssueChange,
      setIssueSeverity(data).then((r) => {
        addGlobalSuccessMessage(
          <FormattedMessage
            id="issue.severity.updated_notification"
            values={{
              issueLink: undefined,
              quality: quality ? translate('software_quality', quality) : undefined,
              before: translate(quality ? 'severity_impact' : 'severity', severityBefore ?? ''),
              after: translate(quality ? 'severity_impact' : 'severity', severity),
            }}
          />,
        );
        return r;
      }),
    );
  };

  handleKeyDown = (event: KeyboardEvent) => {
    if (isInput(event) || isShortcut(event) || !getKeyboardShortcutEnabled()) {
      return true;
    } else if (event.key === KeyboardKeys.KeyF) {
      event.preventDefault();
      this.handleIssuePopupToggle('transition');

      return undefined;
    } else if (event.key === KeyboardKeys.KeyA) {
      event.preventDefault();
      this.handleIssuePopupToggle('assign');

      return undefined;
    } else if (event.key === KeyboardKeys.KeyM && this.props.issue.actions.includes('assign')) {
      event.preventDefault();
      this.handleAssignement('_me');

      return undefined;
    } else if (event.key === KeyboardKeys.KeyT) {
      event.preventDefault();
      this.handleIssuePopupToggle('edit-tags');

      return undefined;
    }

    return true;
  };

  renderRuleDescription = () => {
    const {
      issue,
      ruleDetails: { key, name, isExternal },
    } = this.props;

    return (
      <Note>
        <span className="sw-pr-1">{name}</span>
        {isExternal ? (
          <span>({key})</span>
        ) : (
          <Link shouldOpenInNewTab to={getRuleUrl(key)}>
            {key}
          </Link>
        )}
        <WorkspaceContext.Consumer>
          {({ externalRulesRepoNames }) => {
            const ruleEngine =
              (issue.externalRuleEngine && externalRulesRepoNames[issue.externalRuleEngine]) ||
              issue.externalRuleEngine;
            if (ruleEngine) {
              return <Badge className="sw-ml-1">{ruleEngine}</Badge>;
            }

            return null;
          }}
        </WorkspaceContext.Consumer>
      </Note>
    );
  };

  render() {
    const { issue, branchLike } = this.props;
    const { issuePopupName } = this.state;
    const issueUrl = getComponentIssuesUrl(issue.project, {
      ...getBranchLikeQuery(branchLike),
      issues: issue.key,
      open: issue.key,
      types: issue.type === IssueType.SecurityHotspot ? issue.type : undefined,
    });

    const canSetTags = issue.actions.includes(IssueActions.SetTags);

    return (
      <header className="sw-flex sw-mb-6">
        <div className="sw-mr-8 sw-flex-1 sw-flex sw-flex-col sw-gap-4 sw-min-w-0">
          <div className="sw-flex sw-flex-col sw-gap-2">
            <div className="sw-flex sw-items-center">
              <PageContentFontWrapper as="h1" className="sw-typo-lg-semibold">
                <IssueMessageHighlighting
                  message={issue.message}
                  messageFormattings={issue.messageFormattings}
                />
                <ClipboardIconButton
                  Icon={IconLink}
                  aria-label={translate('permalink')}
                  className="sw-ml-1 sw-align-bottom"
                  copyValue={getPathUrlAsString(issueUrl, false)}
                  discreet
                />
              </PageContentFontWrapper>
            </div>

            <div className="sw-flex sw-items-center sw-justify-between">
              {this.renderRuleDescription()}
            </div>
          </div>

          <IssueHeaderMeta issue={issue} />

          <BasicSeparator />

          <IssueActionsBar
            canSetTags={canSetTags}
            currentPopup={issuePopupName}
            issue={issue}
            onAssign={this.handleAssignement}
            onChange={this.props.onIssueChange}
            showSonarLintBadge
            showTags
            togglePopup={this.handleIssuePopupToggle}
          />
        </div>
        <IssueHeaderSide
          issue={issue}
          onSetSeverity={
            issue.actions.includes(IssueActions.SetSeverity) ? this.handleSeverityChange : undefined
          }
        />
      </header>
    );
  }
}
