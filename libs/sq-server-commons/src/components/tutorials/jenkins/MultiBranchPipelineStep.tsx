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
import { CodeSnippet, NumberedList, NumberedListItem, TutorialStep } from '../../../design-system';
import { translate } from '../../../helpers/l10n';
import {
  AlmKeys,
  AlmSettingsInstance,
  ProjectAlmBindingResponse,
} from '../../../types/alm-settings';
import LabelActionPair from '../components/LabelActionPair';
import LabelValuePair from '../components/LabelValuePair';
import SentenceWithHighlights from '../components/SentenceWithHighlights';
import { buildGithubLink } from '../utils';

export interface MultiBranchPipelineStepProps {
  alm: AlmKeys;
  almBinding?: AlmSettingsInstance;

  projectBinding?: ProjectAlmBindingResponse | null;
}

/* Capture [workspaceID] from this pattern: https://bitbucket.org/[workspaceId]/  */
const bitbucketcloudUrlRegex = /https:\/\/bitbucket.org\/(.+)\//;

function extractBitbucketCloudWorkspaceId(almBinding?: AlmSettingsInstance): string | undefined {
  if (almBinding?.url) {
    const result = bitbucketcloudUrlRegex.exec(almBinding.url);

    return result ? result[1] : undefined;
  }
}

export default function MultiBranchPipelineStep(props: MultiBranchPipelineStepProps) {
  const { alm, almBinding, projectBinding } = props;

  const workspaceId = extractBitbucketCloudWorkspaceId(almBinding);
  const isGitLab = alm === AlmKeys.GitLab;
  const isBitbucketServer = alm === AlmKeys.BitbucketServer;
  const isBitbucketCloud = alm === AlmKeys.BitbucketCloud;
  const isGitHub = alm === AlmKeys.GitHub;

  return (
    <TutorialStep title={translate('onboarding.tutorial.with.jenkins.multi_branch_pipeline.title')}>
      <p className="sw-mb-4">
        {translate('onboarding.tutorial.with.jenkins.multi_branch_pipeline.intro')}
      </p>
      <NumberedList>
        <NumberedListItem>
          <SentenceWithHighlights
            highlightKeys={['new_item', 'type']}
            translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step1"
          />
        </NumberedListItem>
        <NumberedListItem>
          <SentenceWithHighlights
            highlightKeys={['tab', 'source']}
            translationKey={`onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.${alm}`}
          />
          <Text as="ul" className="sw-max-w-full sw-ml-6">
            {isBitbucketServer && (
              <>
                <li>
                  <LabelActionPair translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucket.server" />
                </li>
                <li>
                  <LabelActionPair translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucket.creds" />
                </li>
                <li>
                  {projectBinding?.repository ? (
                    <LabelValuePair
                      translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucket.owner"
                      value={projectBinding.repository}
                    />
                  ) : (
                    <LabelActionPair translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucket.owner" />
                  )}
                </li>
                <li>
                  {projectBinding?.slug ? (
                    <LabelValuePair
                      translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucket.repo"
                      value={projectBinding.slug}
                    />
                  ) : (
                    <LabelActionPair translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucket.repo" />
                  )}
                </li>
              </>
            )}
            {isBitbucketCloud && (
              <>
                <li>
                  <LabelActionPair translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucketcloud.server" />
                </li>
                <li>
                  <LabelActionPair translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucketcloud.creds" />
                </li>
                <li>
                  {workspaceId ? (
                    <LabelValuePair
                      translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucketcloud.owner"
                      value={workspaceId}
                    />
                  ) : (
                    <LabelActionPair translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucketcloud.owner" />
                  )}
                </li>
                <li>
                  {projectBinding?.repository ? (
                    <LabelValuePair
                      translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucketcloud.repo"
                      value={projectBinding.repository}
                    />
                  ) : (
                    <LabelActionPair translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.bitbucketcloud.repo" />
                  )}
                </li>
              </>
            )}
            {isGitHub && (
              <>
                <li>
                  <LabelActionPair translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.github.creds" />
                </li>
                <li>
                  {almBinding !== undefined &&
                  projectBinding != null &&
                  buildGithubLink(almBinding, projectBinding) !== null ? (
                    <LabelValuePair
                      translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.github.repo_url"
                      value={buildGithubLink(almBinding, projectBinding) as string}
                    />
                  ) : (
                    <LabelActionPair translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.github.repo_url" />
                  )}
                </li>
              </>
            )}
            {isGitLab && (
              <>
                <li>
                  <LabelActionPair translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.gitlab.creds" />
                </li>
                <li>
                  <LabelActionPair translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.gitlab.owner" />
                </li>
                <li>
                  <LabelActionPair translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.gitlab.repo" />
                </li>
              </>
            )}
            <li>
              <strong>
                {translate(
                  'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.label',
                )}
                :
              </strong>
              <Text as="ul" className="sw-max-w-full sw-ml-4 sw-mt-1">
                <li>
                  <LabelActionPair
                    translationKey={`onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.${
                      isGitLab ? 'branches_mrs' : 'branches_prs'
                    }`}
                  />
                </li>
                <li>
                  <LabelActionPair
                    translationKey={`onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.${
                      isGitLab ? 'discover_mrs' : 'discover_prs'
                    }`}
                  />
                </li>
                <li>
                  <strong>
                    {translate(
                      'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.ref_specs.label',
                    )}
                    :
                  </strong>
                  <Text as="ul" className="sw-list-none sw-max-w-full sw-ml-4 sw-mt-1">
                    <li>
                      <SentenceWithHighlights
                        highlightKeys={['add', 'ref_spec']}
                        translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.ref_specs.add_behaviour"
                      />
                    </li>
                    <li>
                      <SentenceWithHighlights
                        highlightKeys={['ref_spec']}
                        translationKey={`onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.behaviors.ref_specs.${
                          isGitLab ? 'set_mr_ref_specs' : 'set_pr_ref_specs'
                        }`}
                      />
                      <CodeSnippet
                        className="sw-p-4"
                        isOneLine
                        snippet="+refs/heads/*:refs/remotes/@{remote}/*"
                      />
                    </li>
                  </Text>
                </li>
              </Text>
            </li>
          </Text>
          <p className="sw-ml-12">
            {translate(
              'onboarding.tutorial.with.jenkins.multi_branch_pipeline.step2.leave_defaults',
            )}
          </p>
        </NumberedListItem>
        <NumberedListItem>
          <SentenceWithHighlights
            highlightKeys={['tab']}
            translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step3"
          />
          <Text as="ul" className="sw-max-w-full sw-ml-6">
            <li>
              <LabelActionPair translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step3.mode" />
            </li>
            <li>
              <LabelActionPair translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step3.script_path" />
            </li>
          </Text>
        </NumberedListItem>
        <NumberedListItem>
          <SentenceWithHighlights
            highlightKeys={['save']}
            translationKey="onboarding.tutorial.with.jenkins.multi_branch_pipeline.step4"
          />
        </NumberedListItem>
      </NumberedList>
    </TutorialStep>
  );
}
