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

import { Text } from '@sonarsource/echoes-react';
import { NumberedList, NumberedListItem, TutorialStep } from '../../../design-system';
import { translate } from '../../../helpers/l10n';
import { AlmKeys } from '../../../types/alm-settings';
import LabelActionPair from '../components/LabelActionPair';
import SentenceWithHighlights from '../components/SentenceWithHighlights';

export interface PipelineStepProps {
  alm: AlmKeys;
}

export default function PipelineStep(props: PipelineStepProps) {
  const { alm } = props;
  return (
    <TutorialStep title={translate('onboarding.tutorial.with.jenkins.pipeline.title')}>
      <p className="sw-mb-4">{translate('onboarding.tutorial.with.jenkins.pipeline.intro')}</p>
      <NumberedList>
        <NumberedListItem>
          <SentenceWithHighlights
            highlightKeys={['new_item', 'type']}
            translationKey="onboarding.tutorial.with.jenkins.pipeline.step1"
          />
        </NumberedListItem>
        <NumberedListItem>
          {alm === AlmKeys.GitLab ? (
            <>
              <SentenceWithHighlights
                highlightKeys={['tab', 'option']}
                translationKey="onboarding.tutorial.with.jenkins.pipeline.gitlab.step2.trigger"
              />
              <Text as="ul" className="sw-max-w-full sw-list-none sw-ml-6">
                <li>
                  <SentenceWithHighlights
                    highlightKeys={['triggers', 'push_events']}
                    translationKey="onboarding.tutorial.with.jenkins.pipeline.gitlab.step2.pick_triggers"
                  />
                </li>
                <li>
                  <SentenceWithHighlights
                    highlightKeys={['advanced']}
                    translationKey="onboarding.tutorial.with.jenkins.pipeline.gitlab.step2.click_advanced"
                  />
                </li>
                <li>
                  <SentenceWithHighlights
                    highlightKeys={['secret_token', 'generate']}
                    translationKey="onboarding.tutorial.with.jenkins.pipeline.gitlab.step2.secret_token"
                  />
                </li>
              </Text>
            </>
          ) : (
            <SentenceWithHighlights
              highlightKeys={['tab', 'option']}
              translationKey="onboarding.tutorial.with.jenkins.pipeline.step2"
            />
          )}
        </NumberedListItem>
        <NumberedListItem>
          <SentenceWithHighlights
            highlightKeys={['tab']}
            translationKey="onboarding.tutorial.with.jenkins.pipeline.step3"
          />
          <Text as="ul" className="sw-max-w-full sw-list-none sw-ml-6">
            <li>
              <LabelActionPair translationKey="onboarding.tutorial.with.jenkins.pipeline.step3.definition" />
            </li>
            <li>
              <SentenceWithHighlights
                highlightKeys={['label', 'branches_to_build']}
                translationKey="onboarding.tutorial.with.jenkins.pipeline.step3.scm"
              />
            </li>
            <li>
              <LabelActionPair translationKey="onboarding.tutorial.with.jenkins.pipeline.step3.script_path" />
            </li>
          </Text>
        </NumberedListItem>
        <NumberedListItem>
          <SentenceWithHighlights
            highlightKeys={['save']}
            translationKey="onboarding.tutorial.with.jenkins.pipeline.step4"
          />
        </NumberedListItem>
      </NumberedList>
    </TutorialStep>
  );
}
