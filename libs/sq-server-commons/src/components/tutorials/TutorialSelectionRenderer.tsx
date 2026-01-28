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

import {
  BreadcrumbsItems,
  Heading,
  Layout,
  LinkStandalone,
  MessageCallout,
  MessageVariety,
  Spinner,
  Text,
} from '@sonarsource/echoes-react';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useFlags } from '~adapters/helpers/feature-flags';
import { useProjectBranchesQuery } from '~adapters/queries/branch';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { isMainBranch } from '~shared/helpers/branch-like';
import { GreyCard } from '../../design-system';
import { getProjectTutorialLocation } from '../../helpers/urls';
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
          <FormattedMessage id={`onboarding.tutorial.choose_method.${mode}`} />
        </span>
      </LinkStandalone>

      {mode === TutorialModes.Local && (
        <Text as="p" className="sw-mt-3" isSubtle>
          <FormattedMessage id="onboarding.mode.help.manual" />
        </Text>
      )}

      {mode === TutorialModes.OtherCI && (
        <Text as="p" className="sw-mt-3" isSubtle>
          <FormattedMessage id="onboarding.mode.help.otherci" />
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

  const intl = useIntl();
  const { frontEndEngineeringEnableSidebarNavigation } = useFlags();
  const { data: branchLikes = [] } = useProjectBranchesQuery(component);

  const mainBranchName =
    (branchLikes.find((b) => isMainBranch(b)) as MainBranch | undefined)?.name ||
    DEFAULT_MAIN_BRANCH_NAME;

  let pageTitle = intl.formatMessage({ id: 'onboarding.tutorial.page.title' });

  const selectedTutorialBreadcrumbs = useMemo<BreadcrumbsItems>(
    () => [
      {
        linkElement: intl.formatMessage({ id: 'onboarding.tutorial.breadcrumbs.home' }),
        to: getProjectTutorialLocation(component.key),
      },
      {
        linkElement: intl.formatMessage({
          id: `onboarding.tutorial.breadcrumbs.${selectedTutorial}`,
        }),
      },
    ],
    [component.key, intl, selectedTutorial],
  );

  if (loading) {
    return (
      <ProjectPageTemplate disableBranchSelector title={pageTitle}>
        <Spinner />
      </ProjectPageTemplate>
    );
  }

  if (!currentUserCanScanProject) {
    return (
      <ProjectPageTemplate disableBranchSelector title={pageTitle}>
        <MessageCallout variety={MessageVariety.Warning}>
          <FormattedMessage id="onboarding.tutorial.no_scan_rights" />
        </MessageCallout>
      </ProjectPageTemplate>
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

  if (!selectedTutorial) {
    return (
      <ProjectPageTemplate
        description={<FormattedMessage id="onboarding.tutorial.page.description" />}
        disableBranchSelector
        header={
          !frontEndEngineeringEnableSidebarNavigation && (
            <Layout.PageHeader
              description={
                <Layout.PageHeader.Description>
                  <FormattedMessage id="onboarding.tutorial.page.description" />
                </Layout.PageHeader.Description>
              }
              title={<Layout.PageHeader.Title>{pageTitle}</Layout.PageHeader.Title>}
            />
          )
        }
        title={pageTitle}
      >
        <AnalysisStatus className="sw-mb-4 sw-w-max" component={component} />

        <div className="sw-flex sw-flex-col">
          <Heading as="h2" hasMarginBottom>
            <FormattedMessage id="onboarding.tutorial.choose_method" />
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
      </ProjectPageTemplate>
    );
  }

  pageTitle = [TutorialModes.Local, TutorialModes.OtherCI].includes(selectedTutorial)
    ? intl.formatMessage({ id: 'onboarding.project_analysis.header' })
    : intl.formatMessage({ id: `onboarding.tutorial.with.${selectedTutorial}.title` });

  const pageDescription = [TutorialModes.Local, TutorialModes.OtherCI].includes(selectedTutorial)
    ? intl.formatMessage({ id: 'onboarding.project_analysis.description' })
    : undefined;

  return (
    <ProjectPageTemplate
      breadcrumbs={selectedTutorialBreadcrumbs}
      description={pageDescription}
      disableBranchSelector
      header={
        !frontEndEngineeringEnableSidebarNavigation && (
          <Layout.PageHeader
            breadcrumbs={<Layout.PageHeader.Breadcrumbs items={selectedTutorialBreadcrumbs} />}
            description={
              pageDescription && (
                <Layout.PageHeader.Description>{pageDescription}</Layout.PageHeader.Description>
              )
            }
            title={<Layout.PageHeader.Title>{pageTitle}</Layout.PageHeader.Title>}
          />
        )
      }
      title={pageTitle}
    >
      <AnalysisStatus className="sw-mb-4 sw-w-max" component={component} />

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
    </ProjectPageTemplate>
  );
}
