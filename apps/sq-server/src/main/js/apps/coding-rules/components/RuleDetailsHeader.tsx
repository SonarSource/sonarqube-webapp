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

import { IconLink } from '@sonarsource/echoes-react';
import { Title } from '~design-system';
import { ClipboardIconButton } from '~shared/components/clipboard';
import { IssueMessageHighlighting } from '~shared/components/issues/IssueMessageHighlighting';
import { RuleDetails } from '~shared/types/rules';
import { translate } from '~sq-server-commons/helpers/l10n';
import { getPathUrlAsString, getRuleUrl } from '~sq-server-commons/helpers/urls';
import RuleDetailsHeaderActions from './RuleDetailsHeaderActions';
import RuleDetailsHeaderMeta from './RuleDetailsHeaderMeta';
import RuleDetailsHeaderSide from './RuleDetailsHeaderSide';

interface Props {
  canWrite: boolean | undefined;
  onTagsChange: (tags: string[]) => void;
  referencedRepositories: Record<string, { key: string; language: string; name: string }>;
  ruleDetails: RuleDetails;
}

export default function RuleDetailsMeta(props: Readonly<Props>) {
  const { ruleDetails, onTagsChange, referencedRepositories, canWrite } = props;
  const ruleUrl = getRuleUrl(ruleDetails.key);

  const hasTypeData = !ruleDetails.isExternal || ruleDetails.type !== 'UNKNOWN';
  return (
    <header className="sw-flex sw-mb-6">
      <div className="sw-mr-8 sw-grow sw-flex sw-flex-col sw-gap-4">
        <Title className="sw-mb-0">
          <IssueMessageHighlighting message={ruleDetails.name} />
          <ClipboardIconButton
            Icon={IconLink}
            aria-label={translate('permalink')}
            className="sw-ml-1 sw-align-bottom"
            copyValue={getPathUrlAsString(ruleUrl, ruleDetails.isExternal)}
            discreet
          />
        </Title>

        <div className="sw-flex sw-flex-wrap sw-gap-2">
          {hasTypeData && (
            <RuleDetailsHeaderMeta
              referencedRepositories={referencedRepositories}
              ruleDetails={ruleDetails}
            />
          )}

          <RuleDetailsHeaderActions
            canWrite={canWrite}
            onTagsChange={onTagsChange}
            referencedRepositories={referencedRepositories}
            ruleDetails={ruleDetails}
          />
        </div>
      </div>

      <RuleDetailsHeaderSide ruleDetails={ruleDetails} />
    </header>
  );
}
