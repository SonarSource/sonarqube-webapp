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
import { FormattedMessage } from 'react-intl';
import { ClipboardIconButton } from '~shared/components/clipboard';
import {
  BasicSeparator,
  NumberedList,
  NumberedListItem,
  TutorialStep,
} from '../../../design-system';
import { translate } from '../../../helpers/l10n';
import { Component } from '../../../types/types';
import { LoggedInUser } from '../../../types/users';
import { InlineSnippet } from '../components/InlineSnippet';
import TokenStepGenerator from '../components/TokenStepGenerator';

export interface EnvironmentVariablesStepProps {
  baseUrl: string;
  component: Component;
  currentUser: LoggedInUser;
}

const pipelineDescriptionLinkLabel = translate(
  'onboarding.tutorial.with.gitlab_ci.variables.description.link',
);

export default function EnvironmentVariablesStep(props: EnvironmentVariablesStepProps) {
  const { baseUrl, component, currentUser } = props;

  const renderForm = () => (
    <NumberedList>
      <NumberedListItem>
        {translate('onboarding.tutorial.with.gitlab_ci.variables.section.title')}

        <FormattedMessage
          id="onboarding.tutorial.with.gitlab_ci.variables.section.description"
          values={{
            /* This link will be added when the backend provides the project URL */
            link: <b>{pipelineDescriptionLinkLabel}</b>,
          }}
        />

        <Text as="ul" className="sw-max-w-full sw-ml-4">
          <li>
            <FormattedMessage
              id="onboarding.tutorial.with.gitlab_ci.variables.step1"
              values={{
                extra: (
                  <ClipboardIconButton className="sw-ml-1 sw-align-sub" copyValue="SONAR_TOKEN" />
                ),

                value: <InlineSnippet snippet="SONAR_TOKEN" />,
              }}
            />
          </li>
          <li>
            <TokenStepGenerator component={component} currentUser={currentUser} />
          </li>
          <li>
            <FormattedMessage
              id="onboarding.tutorial.with.gitlab_ci.variables.step3"
              values={{
                value: (
                  <b>{translate('onboarding.tutorial.with.gitlab_ci.variables.step3.value')}</b>
                ),
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="onboarding.tutorial.with.gitlab_ci.variables.section.step4"
              values={{
                value: (
                  <b>
                    {translate('onboarding.tutorial.with.gitlab_ci.variables.section.step4.value')}
                  </b>
                ),
              }}
            />
          </li>
        </Text>
        <BasicSeparator className="sw-my-6" />
      </NumberedListItem>
      <NumberedListItem>
        {translate('onboarding.tutorial.with.gitlab_ci.variables.section2.title')}

        <FormattedMessage
          id="onboarding.tutorial.with.gitlab_ci.variables.section2.description"
          values={{
            /* This link will be added when the backend provides the project URL */
            link: <b>{pipelineDescriptionLinkLabel}</b>,
          }}
        />

        <Text as="ul" className="sw-max-w-full sw-ml-4">
          <li>
            <FormattedMessage
              id="onboarding.tutorial.with.gitlab_ci.variables.step1"
              values={{
                extra: (
                  <ClipboardIconButton
                    className="sw-ml-1 sw-align-sub"
                    copyValue="SONAR_HOST_URL"
                  />
                ),
                value: <InlineSnippet snippet="SONAR_HOST_URL" />,
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="onboarding.tutorial.env_variables"
              values={{
                extra: <ClipboardIconButton className="sw-ml-1 sw-align-sub" copyValue={baseUrl} />,
                field: <b>{translate('onboarding.tutorial.env_variables.field')}</b>,
                value: <InlineSnippet snippet={baseUrl} />,
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="onboarding.tutorial.with.gitlab_ci.variables.step3"
              values={{
                value: (
                  <b>{translate('onboarding.tutorial.with.gitlab_ci.variables.step3.value')}</b>
                ),
              }}
            />
          </li>
          <li>
            <FormattedMessage
              id="onboarding.tutorial.with.gitlab_ci.variables.section2.step4"
              values={{
                value: (
                  <b>
                    {translate('onboarding.tutorial.with.gitlab_ci.variables.section.step4.value')}
                  </b>
                ),
              }}
            />
          </li>
        </Text>
      </NumberedListItem>
    </NumberedList>
  );

  return (
    <TutorialStep title={translate('onboarding.tutorial.with.gitlab_ci.variables.title')}>
      {renderForm()}
    </TutorialStep>
  );
}
