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

import { Heading, IconPullrequest, Link, LinkHighlight, Text } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { PullRequest } from '~shared/types/branch-like';
import { getPullRequestUrl } from '~sq-server-commons/helpers/urls';
import { Component } from '~sq-server-commons/types/types';

interface IssuesListTitleProps {
  component?: Component;
  fixedInPullRequest: string;
  pullRequests: PullRequest[];
}

export default function IssuesListTitle({
  fixedInPullRequest,
  pullRequests,
  component,
}: Readonly<IssuesListTitleProps>) {
  const intl = useIntl();
  const pullRequest = pullRequests.find((pr) => pr.key === fixedInPullRequest);
  const prSummaryUrl = getPullRequestUrl(component?.key ?? '', fixedInPullRequest);

  return pullRequest && !component?.needIssueSync ? (
    <>
      <Heading as="h2" className="sw-mt-6 sw-mb-2">
        <FormattedMessage id="issues.fixed_issues" />
      </Heading>
      <Text as="p" className="sw-mb-2 sw-max-w-full">
        <FormattedMessage
          id="issues.fixed_issues.description"
          values={{
            pullRequest: (
              <>
                <IconPullrequest />
                <Link highlight={LinkHighlight.CurrentColor} to={prSummaryUrl}>
                  {pullRequest.title}
                </Link>
              </>
            ),
          }}
        />
      </Text>
    </>
  ) : (
    <Heading as="h2" className="sw-sr-only">
      {intl.formatMessage({ id: 'list_of_issues' })}
    </Heading>
  );
}
