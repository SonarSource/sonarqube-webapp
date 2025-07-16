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

import { Link, LinkStandalone, MessageCallout, MessageVariety } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { ClipboardIconButton } from '~shared/components/clipboard';
import { BasicSeparator, NumberedList, NumberedListItem } from '../../../design-system';
import { translate } from '../../../helpers/l10n';
import { useProjectBindingQuery } from '../../../queries/devops-integration';
import { AlmSettingsInstance } from '../../../types/alm-settings';
import { Component } from '../../../types/types';
import { LoggedInUser } from '../../../types/users';
import { InlineSnippet } from '../components/InlineSnippet';
import SentenceWithHighlights from '../components/SentenceWithHighlights';
import TokenStepGenerator from '../components/TokenStepGenerator';
import { buildGithubLink } from '../utils';

export interface SecretStepProps {
  almBinding?: AlmSettingsInstance;
  baseUrl: string;
  component: Component;
  currentUser: LoggedInUser;
  monorepo?: boolean;
}

export default function SecretStep(props: Readonly<SecretStepProps>) {
  const { almBinding, baseUrl, component, currentUser, monorepo } = props;
  const { data: projectBinding } = useProjectBindingQuery(component.key);

  return (
    <>
      <FormattedMessage
        id="onboarding.tutorial.with.github_action.secret.intro"
        values={{
          settings_secret:
            almBinding && projectBinding ? (
              <LinkStandalone
                enableOpenInNewTab
                to={`${buildGithubLink(almBinding, projectBinding)}/settings/secrets/actions`}
              >
                {translate('onboarding.tutorial.with.github_action.secret.intro.link')}
              </LinkStandalone>
            ) : (
              <span className="sw-typo-semibold">
                {translate('onboarding.tutorial.with.github_action.secret.intro.link')}
              </span>
            ),
        }}
      />
      <NumberedList>
        <NumberedListItem>
          <SentenceWithHighlights
            highlightKeys={['new_secret']}
            translationKey="onboarding.tutorial.with.github_action.secret.new"
          />
        </NumberedListItem>
        <NumberedListItem>
          <SentenceWithHighlights
            highlightKeys={['name']}
            translationKey="onboarding.tutorial.with.github_action.secret.name"
          />
          <InlineSnippet className="sw-ml-1" snippet="SONAR_TOKEN" />
          <ClipboardIconButton className="sw-ml-2 sw-align-sub" copyValue="SONAR_TOKEN" />
        </NumberedListItem>
        <NumberedListItem>
          <TokenStepGenerator component={component} currentUser={currentUser} />
        </NumberedListItem>
        <NumberedListItem>
          <SentenceWithHighlights
            highlightKeys={['add_secret']}
            translationKey="onboarding.tutorial.with.github_action.secret.add"
          />
          {monorepo && (
            <MessageCallout className="sw-block sw-w-fit sw-mt-4" variety={MessageVariety.Info}>
              <div>
                <div>
                  <FormattedMessage
                    id="onboarding.tutorial.with.github_action.create_secret.monorepo_project_level_token_info"
                    values={{
                      link: (
                        <Link to="/account/security">
                          <FormattedMessage id="onboarding.tutorial.with.github_action.create_secret.monorepo_project_level_token_info.link" />
                        </Link>
                      ),
                    }}
                  />
                </div>
                <div className="sw-mt-2">
                  <FormattedMessage id="onboarding.tutorial.with.github_action.create_secret.monorepo_global_token_info" />
                </div>
              </div>
            </MessageCallout>
          )}
        </NumberedListItem>
      </NumberedList>
      <BasicSeparator className="sw-my-6" />
      <NumberedList>
        <NumberedListItem>
          <SentenceWithHighlights
            highlightKeys={['new_secret']}
            translationKey="onboarding.tutorial.with.github_action.secret.new"
          />
        </NumberedListItem>
        <NumberedListItem>
          <SentenceWithHighlights
            highlightKeys={['name']}
            translationKey="onboarding.tutorial.with.github_action.secret.name"
          />
          <InlineSnippet className="sw-ml-1" snippet="SONAR_HOST_URL" />
          <ClipboardIconButton className="sw-ml-2 sw-align-sub" copyValue="SONAR_HOST_URL" />
        </NumberedListItem>
        <NumberedListItem>
          <FormattedMessage
            id="onboarding.tutorial.env_variables"
            values={{
              extra: <ClipboardIconButton className="sw-ml-1 sw-align-sub" copyValue={baseUrl} />,
              field: (
                <span className="sw-typo-semibold">
                  {translate('onboarding.tutorial.env_variables.field')}
                </span>
              ),
              value: <InlineSnippet className="sw-ml-1" snippet={baseUrl} />,
            }}
          />
        </NumberedListItem>
        <NumberedListItem>
          <SentenceWithHighlights
            highlightKeys={['add_secret']}
            translationKey="onboarding.tutorial.with.github_action.secret.add"
          />
        </NumberedListItem>
      </NumberedList>
    </>
  );
}
