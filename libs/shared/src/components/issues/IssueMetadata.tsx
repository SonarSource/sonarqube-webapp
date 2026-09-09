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
import { CodeAttribute, CodeAttributeCategory } from '../../types/clean-code-taxonomy';
import { CleanCodeAttributePill } from '../badges/CleanCodeAttributePill';
import DateFromNow from '../intl/DateFromNow';
import { AdvancedSastBadge, hasAdvancedSastTags } from './AdvancedSastBadge';
import { IssueTags } from './IssueTags';

interface IssueMetadataIssue {
  cleanCodeAttribute?: CodeAttribute;
  cleanCodeAttributeCategory: CodeAttributeCategory;
  creationDate: string;
  effort?: string;
  internalTags?: string[];
  key: string;
  tags?: string[];
  textRange?: { endLine: number };
}

interface Props {
  issue: IssueMetadataIssue;
  tags?: {
    canSetTags?: boolean;
    overlay?: ReactNode;
    selectedIssueKey?: string;
  };
}

export function IssueMetadata({ issue, tags }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  return (
    // temporary: The aside is sticky to the top of the page, but we want it to be below the header and the issue title bar. The header is 64px and the issue title bar is 256px, so we set the top to 320px.
    <aside className="sw-sticky sw-top-[320px] sw-self-start">
      <dl className="sw-flex sw-flex-col sw-gap-2">
        <dt>
          <Text isHighlighted>{formatMessage({ id: 'issue.details.code_attribute' })}</Text>
        </dt>
        <dd>
          <CleanCodeAttributePill
            cleanCodeAttribute={issue.cleanCodeAttribute}
            cleanCodeAttributeCategory={issue.cleanCodeAttributeCategory}
          />
        </dd>
        {hasAdvancedSastTags(issue.internalTags) && (
          <>
            <Divider className="sw-my-1" />
            <dt>
              <Text isHighlighted>
                <FormattedMessage id="issue.details.properties" />
              </Text>
            </dt>
            <dd>
              <AdvancedSastBadge />
            </dd>
          </>
        )}
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
