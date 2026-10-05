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

import { Divider, Text, Tooltip } from '@sonarsource/echoes-react';
import { ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { isDefined } from '../../helpers/types';
import {
  CodeAttribute,
  CodeAttributeCategory,
  SoftwareImpactSeverity,
  SoftwareQuality,
  SoftwareQualityImpact,
} from '../../types/clean-code-taxonomy';
import { IssueSeverity } from '../../types/issues';
import { RuleStatus } from '../../types/rules';
import { CleanCodeAttributePill } from '../badges/CleanCodeAttributePill';
import DateFromNow from '../intl/DateFromNow';
import { IssueAssign, type IssueAssignProps } from './IssueAssign';
import { IssueProperties } from './IssueProperties';
import { IssueTags } from './IssueTags';
import { SoftwareImpactPillList } from './SoftwareImpactPillList';

interface IssueMetadataIssue {
  assignee?: string;
  assigneeActive?: boolean;
  assigneeAvatar?: string;
  assigneeName?: string;
  cleanCodeAttribute?: CodeAttribute;
  cleanCodeAttributeCategory: CodeAttributeCategory;
  creationDate: string;
  effort?: string;
  externalRuleEngine?: string;
  impacts?: SoftwareQualityImpact[];
  internalTags?: string[];
  key: string;
  tags?: string[];
}

interface Props {
  assign: {
    canAssign: boolean;
    isSelected: boolean;
    onAssign: IssueAssignProps['onAssign'];
    renderDropdown: IssueAssignProps['renderDropdown'];
  };
  isShortcutEnabled?: boolean;
  issue: IssueMetadataIssue;
  learnMoreUrl?: string;
  tags: {
    canSetTags?: boolean;
    isOpen?: boolean;
    overlay?: ReactNode;
    selectedIssueKey?: string;
    togglePopup?: (popup: string, isOpen?: boolean) => void;
  };
  rule?: { status: RuleStatus; isExternal?: boolean };
  deferralDate?: ReactNode;
  onSetSeverity?: (
    severity: IssueSeverity | SoftwareImpactSeverity,
    quality: SoftwareQuality,
  ) => Promise<void>;
  issueType?: ReactNode;
  line?: number;
  showImpact?: boolean;
  showCleanCodeAttribute?: boolean;
  properties?: ReactNode;
  externalRulesRepoNames?: Record<string, string>;
}

export function IssueMetadata({
  assign,
  isShortcutEnabled,
  issue,
  learnMoreUrl,
  tags,
  rule,
  deferralDate,
  onSetSeverity,
  issueType,
  line,
  showImpact = true,
  showCleanCodeAttribute = true,
  properties,
  externalRulesRepoNames,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();

  return (
    <aside className="sw-self-start">
      <dl className="sw-flex sw-flex-col sw-gap-2">
        <dt>
          <Text isHighlighted>{formatMessage({ id: 'issue.details.assignee' })}</Text>
        </dt>
        <dd>
          <IssueAssign
            canAssign={assign.canAssign}
            isSelected={assign.isSelected}
            isShortcutEnabled={isShortcutEnabled}
            issue={issue}
            onAssign={assign.onAssign}
            renderDropdown={assign.renderDropdown}
          />
        </dd>
        <Divider className="sw-my-1" />

        {deferralDate}

        {issueType}

        {showImpact && (issue.impacts?.length ?? 0) > 0 && (
          <>
            <dt>
              <Text isHighlighted>
                <FormattedMessage id="issue.details.software_quality_impacts" />
              </Text>
            </dt>
            <dd>
              <SoftwareImpactPillList
                className="sw-flex-col"
                learnMoreUrl={learnMoreUrl}
                onSetSeverity={onSetSeverity}
                softwareImpacts={issue.impacts}
              />
            </dd>
            <Divider className="sw-my-1" />
          </>
        )}

        {showCleanCodeAttribute && (
          <>
            <dt>
              <Text isHighlighted>{formatMessage({ id: 'issue.details.code_attribute' })}</Text>
            </dt>
            <dd>
              <CleanCodeAttributePill
                cleanCodeAttribute={issue.cleanCodeAttribute}
                cleanCodeAttributeCategory={issue.cleanCodeAttributeCategory}
              />
            </dd>
            <Divider className="sw-my-1" />
          </>
        )}
        <IssueProperties
          externalRulesRepoNames={externalRulesRepoNames}
          issue={issue}
          properties={properties}
          rule={rule}
        />

        <dt>
          <Text isHighlighted>{formatMessage({ id: 'issue.details.tags' })}</Text>
        </dt>
        <dd>
          <IssueTags
            canSetTags={tags.canSetTags}
            isOpen={tags.isOpen}
            isShortcutEnabled={isShortcutEnabled}
            issue={issue}
            overlay={tags.overlay ?? null}
            selectedIssueKey={tags.selectedIssueKey}
            togglePopup={tags.togglePopup}
          />
        </dd>

        {isDefined(line) && (
          <>
            <Divider className="sw-my-1" />
            <dt>
              <Text isHighlighted>
                <FormattedMessage id="issue.line_affected" />
              </Text>
            </dt>
            <dd>
              <Tooltip content={formatMessage({ id: 'line_number' })}>
                <span className="sw-w-fit">
                  <FormattedMessage id="issue.ncloc_x.short" values={{ 0: line }} />
                </span>
              </Tooltip>
            </dd>
          </>
        )}

        {issue.effort && (
          <>
            <Divider className="sw-my-1" />
            <dt>
              <Text isHighlighted>
                <FormattedMessage id="issue.effort" />
              </Text>
            </dt>
            {/* API sends effort in "5min" format and we need a space in between. This isn't needed in issue list page */}
            <dd>
              {issue.effort.match(/\d+/g)?.[0]} {issue.effort.match(/[a-zA-Z]+/g)?.[0]}
            </dd>
          </>
        )}

        <Divider className="sw-my-1" />
        <dt>
          <Text isHighlighted>
            <FormattedMessage id="issue.introduced" />
          </Text>
        </dt>
        <dd>
          <DateFromNow date={issue.creationDate} />
        </dd>
      </dl>
    </aside>
  );
}
