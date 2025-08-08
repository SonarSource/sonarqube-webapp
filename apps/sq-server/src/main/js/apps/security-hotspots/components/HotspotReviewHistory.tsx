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
import { HtmlFormatter, LightLabel, themeBorder } from '~design-system';
import DateTimeFormatter from '~shared/components/intl/DateTimeFormatter';
import { SafeHTMLInjection, SanitizeLevel } from '~shared/helpers/sanitize';
import CommentActions from '~sq-server-commons/components/findings/CommentActions';
import IssueChangelogDiff from '~sq-server-commons/components/issue/components/IssueChangelogDiff';
import Avatar from '~sq-server-commons/components/ui/Avatar';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { Hotspot, ReviewHistoryType } from '~sq-server-commons/types/security-hotspots';
import { getHotspotReviewHistory } from '../utils';

export interface HotspotReviewHistoryProps {
  hotspot: Hotspot;
  onDeleteComment: (key: string) => void;
  onEditComment: (key: string, comment: string) => void;
}

export default function HotspotReviewHistory(props: Readonly<HotspotReviewHistoryProps>) {
  const { hotspot } = props;
  const history = getHotspotReviewHistory(hotspot);

  return (
    <ul>
      {history.map((historyElt, historyIndex) => {
        const { user, type, diffs, date, html, key, updatable, markdown } = historyElt;
        return (
          <li className="sw-p-2 sw-typo-default" key={historyIndex}>
            <div className="sw-typo-semibold sw-mb-1">
              <DateTimeFormatter date={date} />
            </div>
            <LightLabel as="div" className="sw-flex sw-gap-2">
              {user.name && (
                <div className="sw-flex sw-items-center sw-gap-1">
                  <Avatar hash={user.avatar} name={user.name} size="xs" />
                  <span className="sw-typo-semibold">
                    {user.active ? user.name : translateWithParameters('user.x_deleted', user.name)}
                  </span>
                </div>
              )}

              {type === ReviewHistoryType.Creation && translate('hotspots.review_history.created')}

              {type === ReviewHistoryType.Comment &&
                translate('hotspots.review_history.comment_added')}
            </LightLabel>

            {type === ReviewHistoryType.Diff && diffs && (
              <div className="sw-mt-2">
                {diffs.map((diff, diffIndex) => (
                  <IssueChangelogDiff diff={diff} key={diffIndex} />
                ))}
              </div>
            )}

            {type === ReviewHistoryType.Comment && key && html && markdown && (
              <div className="sw-mt-2 sw-flex sw-justify-between">
                <SafeHTMLInjection htmlAsString={html} sanitizeLevel={SanitizeLevel.USER_INPUT}>
                  <CommentBox className="sw-pl-2 sw-ml-2 sw-typo-default" />
                </SafeHTMLInjection>

                {updatable && (
                  <CommentActions
                    commentKey={key}
                    markdown={markdown}
                    onDeleteComment={props.onDeleteComment}
                    onEditComment={props.onEditComment}
                  />
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

const CommentBox = styled(HtmlFormatter)`
  border-left: ${themeBorder('default', 'activityCommentPipe')};
`;
