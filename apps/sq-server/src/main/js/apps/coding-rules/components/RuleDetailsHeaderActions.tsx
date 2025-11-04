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

import { Text } from '@sonarsource/echoes-react';
import { RuleDetails } from '~shared/types/rules';
import TagsList from '~sq-server-commons/components/tags/TagsList';
import { translate } from '~sq-server-commons/helpers/l10n';
import RuleDetailsTagsPopup from './RuleDetailsTagsPopup';

interface Props {
  canWrite: boolean | undefined;
  onTagsChange: (tags: string[]) => void;
  referencedRepositories: Record<string, { key: string; language: string; name: string }>;
  ruleDetails: RuleDetails;
}

export default function RuleDetailsHeaderActions(props: Readonly<Props>) {
  const { canWrite, ruleDetails, onTagsChange } = props;
  const { sysTags = [], tags = [] } = ruleDetails;
  const allTags = [...sysTags, ...tags];
  const TAGS_TO_DISPLAY = 1;

  return (
    <Text className="sw-flex sw-flex-wrap sw-items-center sw-gap-2" isSubtle size="small">
      {/* Tags */}
      <div className="it__coding-rules-detail-property" data-meta="tags">
        <TagsList
          allowUpdate={canWrite}
          className="sw-typo-sm"
          overlay={
            canWrite ? (
              <RuleDetailsTagsPopup setTags={onTagsChange} sysTags={sysTags} tags={tags} />
            ) : undefined
          }
          tags={allTags.length > 0 ? allTags : [translate('coding_rules.no_tags')]}
          tagsClassName="sw-typo-sm"
          tagsToDisplay={TAGS_TO_DISPLAY}
        />
      </div>
    </Text>
  );
}
