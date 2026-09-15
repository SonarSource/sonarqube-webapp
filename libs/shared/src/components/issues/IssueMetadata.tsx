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
  SoftwareQualityImpact,
} from '../../types/clean-code-taxonomy';
import { RuleStatus } from '../../types/rules';
import { CleanCodeAttributePill } from '../badges/CleanCodeAttributePill';
import DateFromNow from '../intl/DateFromNow';
import { IssueProperties } from './IssueProperties';
import { IssueTags } from './IssueTags';
import { SoftwareImpactPillList } from './SoftwareImpactPillList';

interface IssueMetadataIssue {
  cleanCodeAttribute?: CodeAttribute;
  cleanCodeAttributeCategory: CodeAttributeCategory;
  creationDate: string;
  effort?: string;
  externalRuleEngine?: string;
  impacts?: SoftwareQualityImpact[];
  internalTags?: string[];
  key: string;
  tags?: string[];
  textRange?: { endLine: number };
}

interface Props {
  issue: IssueMetadataIssue;
  learnMoreUrl?: string;
  tags?: {
    canSetTags?: boolean;
    overlay?: ReactNode;
    selectedIssueKey?: string;
  };
  rule?: { status: RuleStatus };
}

export function IssueMetadata({ issue, learnMoreUrl, tags, rule }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  return (
    // temporary: The aside is sticky to the top of the page, but we want it to be below the header and the issue title bar, so we set the top to 260px.
    <aside className="sw-sticky sw-top-[260px] sw-self-start">
      <dl className="sw-flex sw-flex-col sw-gap-2">
        {(issue.impacts?.length ?? 0) > 0 && (
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
                softwareImpacts={issue.impacts}
              />
            </dd>
            <Divider className="sw-my-1" />
          </>
        )}

        <dt>
          <Text isHighlighted>{formatMessage({ id: 'issue.details.code_attribute' })}</Text>
        </dt>
        <dd>
          <CleanCodeAttributePill
            cleanCodeAttribute={issue.cleanCodeAttribute}
            cleanCodeAttributeCategory={issue.cleanCodeAttributeCategory}
          />
        </dd>
        <IssueProperties issue={issue} rule={rule} />
        <Divider className="sw-my-1" />

        <dt>
          <Text isHighlighted>{formatMessage({ id: 'issue.details.tags' })}</Text>
        </dt>
        <dd>
          <IssueTags
            canSetTags={tags?.canSetTags}
            issue={issue}
            overlay={tags?.overlay ?? null}
            selectedIssueKey={tags?.selectedIssueKey}
          />
        </dd>

        {isDefined(issue.textRange) && (
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
                  <FormattedMessage
                    id="issue.ncloc_x.short"
                    values={{ 0: issue.textRange.endLine }}
                  />
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
