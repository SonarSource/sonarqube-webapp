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

import { Link, Text } from '@sonarsource/echoes-react';
import { FormattedMessage } from 'react-intl';
import { CodeSnippet, NumberedListItem } from '../../../design-system';
import { translate } from '../../../helpers/l10n';
import { AlmSettingsInstance, ProjectAlmBindingResponse } from '../../../types/alm-settings';
import LabelActionPair from '../components/LabelActionPair';
import SentenceWithHighlights from '../components/SentenceWithHighlights';
import { buildGithubLink } from '../utils';

export interface WebhookStepGithubProps {
  almBinding?: AlmSettingsInstance;
  branchesEnabled: boolean;
  projectBinding?: ProjectAlmBindingResponse | null;
}

export default function WebhookStepGithub(props: Readonly<WebhookStepGithubProps>) {
  const { almBinding, branchesEnabled, projectBinding } = props;

  const linkUrl =
    almBinding && projectBinding && `${buildGithubLink(almBinding, projectBinding)}/settings/hooks`;

  const webhookUrl = branchesEnabled
    ? '***JENKINS_SERVER_URL***/github-webhook/'
    : '***JENKINS_SERVER_URL***/job/***JENKINS_JOB_NAME***/build?token=***JENKINS_BUILD_TRIGGER_TOKEN***';

  return (
    <>
      <NumberedListItem>
        <FormattedMessage
          id="onboarding.tutorial.with.jenkins.webhook.step1.sentence"
          values={{
            link: linkUrl ? (
              <Link to={linkUrl}>
                {translate('onboarding.tutorial.with.jenkins.webhook.github.step1.link')}
              </Link>
            ) : (
              <strong className="sw-font-semibold">
                {translate('onboarding.tutorial.with.jenkins.webhook.github.step1.link')}
              </strong>
            ),
          }}
        />
        <Text as="ul" className="sw-max-w-full sw-ml-6">
          <li>
            <p>
              <LabelActionPair translationKey="onboarding.tutorial.with.jenkins.webhook.github.step1.url" />
            </p>
            <CodeSnippet className="sw-p-4" isOneLine snippet={webhookUrl} />
          </li>
        </Text>
      </NumberedListItem>
      <NumberedListItem>
        <SentenceWithHighlights
          highlightKeys={['events', 'option']}
          translationKey="onboarding.tutorial.with.jenkins.webhook.github.step2"
        />
        <Text as="ul" className="sw-max-w-full sw-ml-6">
          <li>
            <strong>
              {translate('onboarding.tutorial.with.jenkins.webhook.github.step2.repo')}
            </strong>
          </li>
          {branchesEnabled && (
            <li>
              <strong>
                {translate('onboarding.tutorial.with.jenkins.webhook.github.step2.pr')}
              </strong>
            </li>
          )}
        </Text>
      </NumberedListItem>
      <NumberedListItem>
        <SentenceWithHighlights
          highlightKeys={['add_webhook']}
          translationKey="onboarding.tutorial.with.jenkins.webhook.github.step3"
        />
      </NumberedListItem>
    </>
  );
}
