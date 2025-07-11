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

import {
  Breadcrumbs,
  Heading,
  LinkStandalone,
  MessageCallout,
  MessageVariety,
  Spinner,
  Text,
} from '@sonarsource/echoes-react';
import * as React from 'react';
import { isMainBranch } from '~shared/helpers/branch-like';
import { GreyCard } from '../../design-system';
import { translate } from '../../helpers/l10n';
import { getProjectTutorialLocation } from '../../helpers/urls';
import { useBranchesQuery } from '../../queries/branch';
import { Image } from '../../sq-server-adapters/components/common/Image';
import { AlmKeys, AlmSettingsInstance, ProjectAlmBindingResponse } from '../../types/alm-settings';
import { MainBranch } from '../../types/branch-like';
import { Component } from '../../types/types';
import { LoggedInUser } from '../../types/users';
import { AnalysisStatus } from '../overview/AnalysisStatus';
import AzurePipelinesTutorial from './azure-pipelines/AzurePipelinesTutorial';
import BitbucketPipelinesTutorial from './bitbucket-pipelines/BitbucketPipelinesTutorial';
import GitHubActionTutorial from './github-action/GitHubActionTutorial';
import GitLabCITutorial from './gitlabci/GitLabCITutorial';
import JenkinsTutorial from './jenkins/JenkinsTutorial';
import OtherTutorial from './other/OtherTutorial';
import { TutorialModes } from './types';

const DEFAULT_MAIN_BRANCH_NAME = 'main';

export interface TutorialSelectionRendererProps {
  almBinding?: AlmSettingsInstance;
  baseUrl: string;
  component: Component;
  currentUser: LoggedInUser;
  currentUserCanScanProject: boolean;
  loading: boolean;
  projectBinding?: ProjectAlmBindingResponse | null;
  selectedTutorial?: TutorialModes;
  willRefreshAutomatically?: boolean;
}

function renderAlm(mode: TutorialModes, project: string, icon?: React.ReactNode) {
  return (
    <GreyCard className="sw-col-span-4 sw-p-4">
      <LinkStandalone iconLeft={icon} to={getProjectTutorialLocation(project, mode)}>
        <span className={icon ? 'sw-ml-2' : ''}>
          {translate('onboarding.tutorial.choose_method', mode)}
        </span>
      </LinkStandalone>

      {mode === TutorialModes.Local && (
        <Text as="p" className="sw-mt-3" isSubdued>
          {translate('onboarding.mode.help.manual')}
        </Text>
      )}

      {mode === TutorialModes.OtherCI && (
        <Text as="p" className="sw-mt-3" isSubdued>
          {translate('onboarding.mode.help.otherci')}
        </Text>
      )}
    </GreyCard>
  );
}

export default function TutorialSelectionRenderer(props: Readonly<TutorialSelectionRendererProps>) {
  const {
    almBinding,
    baseUrl,
    component,
    currentUser,
    currentUserCanScanProject,
    loading,
    projectBinding,
    selectedTutorial,
    willRefreshAutomatically,
  } = props;

  const { data: branchLikes = [] } = useBranchesQuery(component);

  const mainBranchName =
    (branchLikes.find((b) => isMainBranch(b)) as MainBranch | undefined)?.name ||
    DEFAULT_MAIN_BRANCH_NAME;

  if (loading) {
    return <Spinner />;
  }

  if (!currentUserCanScanProject) {
    return (
      <MessageCallout className="sw-w-full" variety={MessageVariety.Warning}>
        {translate('onboarding.tutorial.no_scan_rights')}
      </MessageCallout>
    );
  }

  let showGitHubActions = true;
  let showGitLabCICD = true;
  let showBitbucketPipelines = true;
  let showAzurePipelines = true;
  let showJenkins = true;

  if (projectBinding != null) {
    showGitHubActions = projectBinding.alm === AlmKeys.GitHub;
    showGitLabCICD = projectBinding.alm === AlmKeys.GitLab;
    showBitbucketPipelines = projectBinding.alm === AlmKeys.BitbucketCloud;
    showAzurePipelines = [AlmKeys.Azure, AlmKeys.GitHub].includes(projectBinding.alm);

    showJenkins = [
      AlmKeys.BitbucketCloud,
      AlmKeys.BitbucketServer,
      AlmKeys.GitHub,
      AlmKeys.GitLab,
    ].includes(projectBinding.alm);
  }

  return (
    <div className="sw-typo-default">
      <AnalysisStatus className="sw-mb-4 sw-w-max" component={component} />

      {selectedTutorial === undefined && (
        <div className="sw-flex sw-flex-col">
          <Heading as="h1" className="sw-mb-6">
            {translate('onboarding.tutorial.page.title')}
          </Heading>

          <Text>{translate('onboarding.tutorial.page.description')}</Text>

          <Heading as="h2" className="sw-mt-12 sw-mb-4">
            {translate('onboarding.tutorial.choose_method')}
          </Heading>

          <div className="it__tutorial-selection sw-grid sw-gap-6 sw-grid-cols-12">
            {showJenkins &&
              renderAlm(
                TutorialModes.Jenkins,
                component.key,
                <Image
                  alt="" // Should be ignored by screen readers
                  className="sw-h-400 sw-w-200"
                  src="/images/tutorials/jenkins.svg"
                />,
              )}

            {showGitHubActions &&
              renderAlm(
                TutorialModes.GitHubActions,
                component.key,
                <Image
                  alt="" // Should be ignored by screen readers
                  className="sw-h-400 sw-w-200"
                  src="/images/tutorials/github-actions.svg"
                />,
              )}

            {showBitbucketPipelines &&
              renderAlm(
                TutorialModes.BitbucketPipelines,
                component.key,
                <Image
                  alt="" // Should be ignored by screen readers
                  className="sw-h-400 sw-w-200"
                  src="/images/alm/bitbucket.svg"
                />,
              )}

            {showGitLabCICD &&
              renderAlm(
                TutorialModes.GitLabCI,
                component.key,
                <Image
                  alt="" // Should be ignored by screen readers
                  className="sw-h-400 sw-w-200"
                  src="/images/alm/gitlab.svg"
                />,
              )}

            {showAzurePipelines &&
              renderAlm(
                TutorialModes.AzurePipelines,
                component.key,
                <Image
                  alt="" // Should be ignored by screen readers
                  className="sw-h-400 sw-w-200"
                  src="/images/tutorials/azure-pipelines.svg"
                />,
              )}

            {renderAlm(TutorialModes.OtherCI, component.key)}

            {renderAlm(TutorialModes.Local, component.key)}
          </div>
        </div>
      )}

      {selectedTutorial && (
        <Breadcrumbs
          className="sw-mb-3"
          items={[
            {
              linkElement: translate('onboarding.tutorial.breadcrumbs.home'),
              to: getProjectTutorialLocation(component.key),
            },
            {
              linkElement: translate('onboarding.tutorial.breadcrumbs', selectedTutorial),
              to: '#',
            },
          ]}
        />
      )}

      {selectedTutorial === TutorialModes.Local && (
        <OtherTutorial baseUrl={baseUrl} component={component} currentUser={currentUser} isLocal />
      )}

      {selectedTutorial === TutorialModes.OtherCI && (
        <OtherTutorial baseUrl={baseUrl} component={component} currentUser={currentUser} />
      )}

      {selectedTutorial === TutorialModes.BitbucketPipelines && (
        <BitbucketPipelinesTutorial
          almBinding={almBinding}
          baseUrl={baseUrl}
          component={component}
          currentUser={currentUser}
          mainBranchName={mainBranchName}
          willRefreshAutomatically={willRefreshAutomatically}
        />
      )}

      {selectedTutorial === TutorialModes.GitHubActions && (
        <GitHubActionTutorial
          almBinding={almBinding}
          baseUrl={baseUrl}
          component={component}
          currentUser={currentUser}
          mainBranchName={mainBranchName}
          monorepo={projectBinding?.monorepo}
          willRefreshAutomatically={willRefreshAutomatically}
        />
      )}

      {selectedTutorial === TutorialModes.Jenkins && (
        <JenkinsTutorial
          almBinding={almBinding}
          baseUrl={baseUrl}
          component={component}
          willRefreshAutomatically={willRefreshAutomatically}
        />
      )}

      {selectedTutorial === TutorialModes.GitLabCI && (
        <GitLabCITutorial
          baseUrl={baseUrl}
          component={component}
          currentUser={currentUser}
          willRefreshAutomatically={willRefreshAutomatically}
        />
      )}

      {selectedTutorial === TutorialModes.AzurePipelines && (
        <AzurePipelinesTutorial
          alm={projectBinding?.alm}
          baseUrl={baseUrl}
          component={component}
          currentUser={currentUser}
          willRefreshAutomatically={willRefreshAutomatically}
        />
      )}
    </div>
  );
}
