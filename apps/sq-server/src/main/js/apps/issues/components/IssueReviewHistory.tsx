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

import styled from '@emotion/styled';
import { Button, ButtonVariety, Spinner, Text } from '@sonarsource/echoes-react';
import * as React from 'react';
import {
  DestructiveIcon,
  HtmlFormatter,
  InteractiveIcon,
  Modal,
  PencilIcon,
  TrashIcon,
  themeBorder,
} from '~design-system';
import DateTimeFormatter from '~shared/components/intl/DateTimeFormatter';
import { SafeHTMLInjection, SanitizeLevel } from '~shared/helpers/sanitize';
import IssueChangelogDiff from '~sq-server-commons/components/issue/components/IssueChangelogDiff';
import { useGetIssueReviewHistory } from '~sq-server-commons/components/issues/crossComponentSourceViewer/utils';
import Avatar from '~sq-server-commons/components/ui/Avatar';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { useIssueChangelogQuery } from '~sq-server-commons/queries/issues';
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import { ReviewHistoryType } from '~sq-server-commons/types/security-hotspots';
import { Issue, IssueChangelog } from '~sq-server-commons/types/types';
import HotspotCommentModal from '../../security-hotspots/components/HotspotCommentModal';

export interface HotspotReviewHistoryProps {
  issue: Issue;
  onDeleteComment: (key: string) => void;
  onEditComment: (key: string, comment: string) => void;
}

const getUpdatedChangelog = (
  { changelog }: { changelog: IssueChangelog[] },
  isStandardMode = false,
): IssueChangelog[] =>
  changelog
    .map((changelogItem) => {
      const diffHasIssueStatusChange = changelogItem.diffs.some(
        (diff) => diff.key === 'issueStatus',
      );

      const filteredDiffs = changelogItem.diffs.filter((diff) => {
        if (diffHasIssueStatusChange && ['resolution', 'status'].includes(diff.key)) {
          return false;
        }
        return isStandardMode
          ? !['impactSeverity', 'cleanCodeAttribute'].includes(diff.key)
          : !['severity', 'type'].includes(diff.key);
      });

      return {
        ...changelogItem,
        diffs: filteredDiffs,
      };
    })
    .filter((changelogItem) => changelogItem.diffs.length > 0);

export default function IssueReviewHistory(props: Readonly<HotspotReviewHistoryProps>) {
  const { issue } = props;
  const { data: isStandardMode } = useStandardExperienceModeQuery();
  const [editCommentKey, setEditCommentKey] = React.useState('');
  const [deleteCommentKey, setDeleteCommentKey] = React.useState('');
  const { data: changelog = [], isLoading } = useIssueChangelogQuery(issue.key, {
    select: (data) => getUpdatedChangelog(data, isStandardMode),
  });
  const history = useGetIssueReviewHistory(issue, changelog);

  return (
    <Spinner isLoading={isLoading}>
      <ul>
        {history.map(({ user, type, diffs, date, html, key, updatable, markdown }) => {
          return (
            <li className="sw-p-2 sw-typo-default" key={`${user.name}${type}${date}`}>
              <div className="sw-typo-semibold sw-mb-1">
                <DateTimeFormatter date={date} />
              </div>

              <Text as="div" className="sw-mb-1" isSubdued>
                {user.name !== undefined && (
                  <div className="sw-flex sw-items-center sw-gap-1">
                    <Avatar hash={user.avatar} name={user.name} size="xs" />
                    <span className="sw-typo-semibold">
                      {user.active
                        ? user.name
                        : translateWithParameters('user.x_deleted', user.name)}
                    </span>
                  </div>
                )}

                {type === ReviewHistoryType.Creation &&
                  translate('issue.activity.review_history.created')}

                {type === ReviewHistoryType.Comment &&
                  translate('issue.activity.review_history.comment_added')}
              </Text>

              {type === ReviewHistoryType.Diff && diffs && (
                <div className="sw-mt-2">
                  {diffs.map((diff) => (
                    <IssueChangelogDiff
                      diff={diff}
                      key={date + diff.key + diff.newValue + diff.oldValue}
                    />
                  ))}
                </div>
              )}

              {type === ReviewHistoryType.Comment && key && html && markdown && (
                <div className="sw-mt-2 sw-flex sw-justify-between">
                  <SafeHTMLInjection htmlAsString={html} sanitizeLevel={SanitizeLevel.USER_INPUT}>
                    <CommentBox className="sw-pl-2 sw-ml-2 sw-typo-default" />
                  </SafeHTMLInjection>

                  {updatable && (
                    <div className="sw-flex sw-gap-6">
                      <InteractiveIcon
                        Icon={PencilIcon}
                        aria-label={translate('issue.comment.edit')}
                        onClick={() => {
                          setEditCommentKey(key);
                        }}
                        size="small"
                        stopPropagation={false}
                      />

                      <DestructiveIcon
                        Icon={TrashIcon}
                        aria-label={translate('issue.comment.delete')}
                        onClick={() => {
                          setDeleteCommentKey(key);
                        }}
                        size="small"
                        stopPropagation={false}
                      />
                    </div>
                  )}

                  {editCommentKey === key && (
                    <HotspotCommentModal
                      onCancel={() => {
                        setEditCommentKey('');
                      }}
                      onSubmit={(comment) => {
                        setEditCommentKey('');
                        props.onEditComment(key, comment);
                      }}
                      value={markdown}
                    />
                  )}

                  {deleteCommentKey === key && (
                    <Modal
                      body={<p>{translate('issue.comment.delete_confirm_message')}</p>}
                      headerTitle={translate('issue.comment.delete')}
                      onClose={() => {
                        setDeleteCommentKey('');
                      }}
                      primaryButton={
                        <Button
                          onClick={() => {
                            setDeleteCommentKey('');
                            props.onDeleteComment(key);
                          }}
                          variety={ButtonVariety.Danger}
                        >
                          {translate('delete')}
                        </Button>
                      }
                      secondaryButtonLabel={translate('cancel')}
                    />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Spinner>
  );
}

const CommentBox = styled(HtmlFormatter)`
  border-left: ${themeBorder('default', 'activityCommentPipe')};
`;
