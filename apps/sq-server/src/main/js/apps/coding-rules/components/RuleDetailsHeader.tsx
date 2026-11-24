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

import styled from '@emotion/styled';
import {
  ButtonIcon,
  IconArrowLeft,
  IconLink,
  Layout,
  LoadingSkeleton,
} from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { To } from 'react-router';
import { ClipboardIconButton } from '~shared/components/clipboard';
import { IssueMessageHighlighting } from '~shared/components/issues/IssueMessageHighlighting';
import { getPathUrlAsString, getRuleUrl } from '~sq-server-commons/helpers/urls';
import { useRuleDetailsQuery, useUpdateRuleMutation } from '~sq-server-commons/queries/rules';
import RuleDetailsHeaderActions from './RuleDetailsHeaderActions';
import RuleDetailsHeaderMeta from './RuleDetailsHeaderMeta';
import RuleDetailsHeaderSide from './RuleDetailsHeaderSide';

interface Props {
  canWrite: boolean | undefined;
  listPath: To;
  onClose: () => void;
  ruleKey: string;
  referencedRepositories: Record<string, { key: string; language: string; name: string }>;
}

export default function RuleDetailsHeader(props: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const { ruleKey, referencedRepositories, canWrite, listPath, onClose } = props;
  const ruleUrl = getRuleUrl(ruleKey);
  const { isLoading: isLoadingRule, data: ruleDetailsData } = useRuleDetailsQuery({
    actives: true,
    key: ruleKey,
  });

  const { rule: ruleDetails } = ruleDetailsData ?? {};
  const hasTypeData = !ruleDetails?.isExternal || ruleDetails?.type !== 'UNKNOWN';

  const { mutate: updateRule } = useUpdateRuleMutation();

  const handleTagsChange = (tags: string[]) => {
    updateRule({ key: ruleKey, tags: tags.join() });
  };

  return (
    <Layout.ContentHeader
      actions={
        ruleDetails && (
          <span className="sw:-mt-8">
            <RuleDetailsHeaderSide ruleDetails={ruleDetails} />
          </span>
        )
      }
      breadcrumbs={
        <Layout.ContentHeader.Breadcrumbs
          items={[
            { linkElement: formatMessage({ id: 'coding_rules.page' }), to: listPath },
            { linkElement: ruleKey },
          ]}
        />
      }
      // UI test hook: header content lives outside `.it__coding-rule-details`.
      className="it__coding-rule-details-header"
      description={
        <LoadingSkeleton isLoading={isLoadingRule} variety="text">
          {ruleDetails && (
            <span className="sw:flex sw:gap-4">
              {hasTypeData ? (
                <RuleDetailsHeaderMeta
                  referencedRepositories={referencedRepositories}
                  ruleDetails={ruleDetails}
                >
                  <RuleDetailsHeaderActions
                    canWrite={canWrite}
                    onTagsChange={handleTagsChange}
                    referencedRepositories={referencedRepositories}
                    ruleDetails={ruleDetails}
                  />
                </RuleDetailsHeaderMeta>
              ) : (
                <RuleDetailsHeaderActions
                  canWrite={canWrite}
                  onTagsChange={handleTagsChange}
                  referencedRepositories={referencedRepositories}
                  ruleDetails={ruleDetails}
                />
              )}
            </span>
          )}
        </LoadingSkeleton>
      }
      hasDivider
      title={
        <RulesHeaderTitle
          headingLevel="h1"
          prefix={
            <ButtonIcon
              Icon={IconArrowLeft}
              ariaLabel={formatMessage({ id: 'back' })}
              onClick={onClose}
              variety="default-ghost"
            />
          }
          suffix={
            ruleDetails && (
              <ClipboardIconButton
                Icon={IconLink}
                aria-label={formatMessage({ id: 'permalink' })}
                copyValue={getPathUrlAsString(ruleUrl, ruleDetails.isExternal)}
                discreet
              />
            )
          }
        >
          {ruleDetails ? (
            <IssueMessageHighlighting message={ruleDetails.name} />
          ) : (
            // Skeletons render a div, which is invalid inside the h1.
            ruleKey
          )}
        </RulesHeaderTitle>
      }
    />
  );
}

const RulesHeaderTitle = styled(Layout.ContentHeader.Title)`
  h1 {
    max-width: 100% !important;
  }
`;
