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

import { ButtonIcon, IconArrowLeft, IconLink, Layout } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { ClipboardIconButton } from '../clipboard';

interface Props {
  title: string | React.ReactNode;
  issuePermalink: string;
  closeIssue: () => void;
}

export function IssueTitle({ title, issuePermalink, closeIssue }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  return (
    <div className="sw-flex sw-items-start sw-mb-2">
      <ButtonIcon
        Icon={IconArrowLeft}
        ariaLabel={formatMessage({ id: 'issue.back_to_issues_list' })}
        className="sw-align-middle sw-mr-3 sw-mb-1"
        onClick={closeIssue}
        size="medium"
        tooltipContent={formatMessage({ id: 'issue.back_to_issues_list' })}
      />
      <Layout.PageHeader.Title className=" sw-flex sw-justify-center" headingLevel="h2">
        {title}

        <ClipboardIconButton
          Icon={IconLink}
          aria-label={formatMessage({ id: 'permalink' })}
          className="sw-align-middle sw-ml-2 sw-mb-1"
          copyValue={issuePermalink}
          discreet
        />
      </Layout.PageHeader.Title>
    </div>
  );
}
