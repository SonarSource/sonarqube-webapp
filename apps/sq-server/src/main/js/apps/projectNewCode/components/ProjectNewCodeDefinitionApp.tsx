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

import { Spinner } from '@sonarsource/echoes-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { LargeCenteredLayout, PageContentFontWrapper } from '~design-system';
import { isBranch } from '~shared/helpers/branch-like';
import { isDefined } from '~shared/helpers/types';
import { addons } from '~sq-server-addons/index';
import Suggestions from '~sq-server-commons/components/embed-docs-modal/Suggestions';
import { getSettingValue } from '~sq-server-commons/components/new-code-definition/utils';
import withAppStateContext from '~sq-server-commons/context/app-state/withAppStateContext';
import withAvailableFeatures, {
  WithAvailableFeaturesProps,
} from '~sq-server-commons/context/available-features/withAvailableFeatures';
import withComponentContext from '~sq-server-commons/context/componentContext/withComponentContext';
import { sortBranches } from '~sq-server-commons/helpers/branch-like';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { translate } from '~sq-server-commons/helpers/l10n';
import {
  DEFAULT_NEW_CODE_DEFINITION_TYPE,
  getNumberOfDaysDefaultValue,
} from '~sq-server-commons/helpers/new-code-definition';
import { withBranchLikes } from '~sq-server-commons/queries/branch';
import {
  useNewCodeDefinitionMutation,
  useNewCodeDefinitionQuery,
} from '~sq-server-commons/queries/newCodeDefinition';
import { AppState } from '~sq-server-commons/types/appstate';
import { Branch, BranchLike } from '~sq-server-commons/types/branch-like';
import { Feature } from '~sq-server-commons/types/features';
import { NewCodeDefinitionType } from '~sq-server-commons/types/new-code-definition';
import { Component } from '~sq-server-commons/types/types';
import AppHeader from './AppHeader';
import ProjectNewCodeDefinitionSelector from './ProjectNewCodeDefinitionSelector';

interface ProjectNewCodeDefinitionAppProps extends WithAvailableFeaturesProps {
  appState: AppState;
  branchLike: Branch;
  branchLikes: BranchLike[];
  component: Component;
}

function ProjectNewCodeDefinitionApp(props: Readonly<ProjectNewCodeDefinitionAppProps>) {
  const { appState, component, branchLike, branchLikes, hasFeature } = props;

  const [isSpecificNewCodeDefinition, setIsSpecificNewCodeDefinition] = useState<boolean>();
  const [numberOfDays, setNumberOfDays] = useState(getNumberOfDaysDefaultValue());
  const [referenceBranch, setReferenceBranch] = useState<string | undefined>(undefined);
  const [specificAnalysis, setSpecificAnalysis] = useState<string | undefined>(undefined);

  const [selectedNewCodeDefinitionType, setSelectedNewCodeDefinitionType] =
    useState<NewCodeDefinitionType>(DEFAULT_NEW_CODE_DEFINITION_TYPE);

  const {
    data: globalNewCodeDefinition = { type: DEFAULT_NEW_CODE_DEFINITION_TYPE },
    isLoading: isGlobalNCDLoading,
  } = useNewCodeDefinitionQuery();

  const { data: projectNewCodeDefinition, isLoading: isProjectNCDLoading } =
    useNewCodeDefinitionQuery({
      branchName: hasFeature(Feature.BranchSupport) ? undefined : branchLike?.name,
      projectKey: component.key,
    });
  const { isPending: isSaving, mutate: postNewCodeDefinition } = useNewCodeDefinitionMutation();

  const branchList = useMemo(() => {
    return sortBranches(branchLikes.filter(isBranch));
  }, [branchLikes]);

  const isFormTouched = useMemo(() => {
    if (isSpecificNewCodeDefinition === undefined) {
      return false;
    }

    if (isSpecificNewCodeDefinition !== !projectNewCodeDefinition?.inherited) {
      return true;
    }

    if (!isSpecificNewCodeDefinition) {
      return false;
    }

    if (selectedNewCodeDefinitionType !== projectNewCodeDefinition?.type) {
      return true;
    }

    switch (selectedNewCodeDefinitionType) {
      case NewCodeDefinitionType.NumberOfDays:
        return numberOfDays !== String(projectNewCodeDefinition?.value);

      case NewCodeDefinitionType.ReferenceBranch:
        return referenceBranch !== projectNewCodeDefinition?.value;

      case NewCodeDefinitionType.SpecificAnalysis:
        return specificAnalysis !== projectNewCodeDefinition?.value;

      default:
        return false;
    }
  }, [
    isSpecificNewCodeDefinition,
    numberOfDays,
    projectNewCodeDefinition,
    referenceBranch,
    selectedNewCodeDefinitionType,
    specificAnalysis,
  ]);

  const defaultReferenceBranch = branchList[0]?.name;
  const isLoading = isGlobalNCDLoading || isProjectNCDLoading;
  const branchSupportEnabled = hasFeature(Feature.BranchSupport);

  const resetStatesFromProjectNewCodeDefinition = useCallback(() => {
    setIsSpecificNewCodeDefinition(
      projectNewCodeDefinition === undefined ? undefined : !projectNewCodeDefinition.inherited,
    );

    setSelectedNewCodeDefinitionType(
      projectNewCodeDefinition?.type ?? DEFAULT_NEW_CODE_DEFINITION_TYPE,
    );

    setNumberOfDays(getNumberOfDaysDefaultValue(globalNewCodeDefinition, projectNewCodeDefinition));

    setReferenceBranch(
      projectNewCodeDefinition?.type === NewCodeDefinitionType.ReferenceBranch
        ? projectNewCodeDefinition.value
        : defaultReferenceBranch,
    );

    setSpecificAnalysis(
      projectNewCodeDefinition?.type === NewCodeDefinitionType.SpecificAnalysis
        ? projectNewCodeDefinition.value
        : undefined,
    );
  }, [defaultReferenceBranch, globalNewCodeDefinition, projectNewCodeDefinition]);

  const onResetNewCodeDefinition = () => {
    postNewCodeDefinition({
      branch: hasFeature(Feature.BranchSupport) ? undefined : branchLike?.name,
      project: component.key,
      type: undefined,
    });
  };

  const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isSpecificNewCodeDefinition) {
      onResetNewCodeDefinition();
      return;
    }

    const value = getSettingValue({
      type: selectedNewCodeDefinitionType,
      numberOfDays,
      referenceBranch,
    });

    if (selectedNewCodeDefinitionType) {
      postNewCodeDefinition({
        branch: hasFeature(Feature.BranchSupport) ? undefined : branchLike?.name,
        project: component.key,
        type: selectedNewCodeDefinitionType,
        value,
      });
    }
  };

  useEffect(() => {
    setReferenceBranch(defaultReferenceBranch);
  }, [defaultReferenceBranch]);

  useEffect(() => {
    resetStatesFromProjectNewCodeDefinition();
  }, [resetStatesFromProjectNewCodeDefinition]);

  return (
    <LargeCenteredLayout id="new-code-rules-page">
      <Suggestions suggestion={DocLink.NewCodeDefinition} />

      <Helmet defer={false} title={translate('project_baseline.page')} />

      <PageContentFontWrapper className="sw-my-8 sw-typo-default">
        <AppHeader canAdmin={!!appState.canAdmin} />

        <Spinner isLoading={isLoading}>
          <div className="it__project-baseline">
            {globalNewCodeDefinition && isSpecificNewCodeDefinition !== undefined && (
              <ProjectNewCodeDefinitionSelector
                analysis={specificAnalysis}
                branch={branchLike}
                branchList={branchList}
                branchesEnabled={branchSupportEnabled}
                component={component.key}
                days={numberOfDays}
                globalNewCodeDefinition={globalNewCodeDefinition}
                isChanged={isFormTouched}
                newCodeDefinitionType={projectNewCodeDefinition?.type}
                newCodeDefinitionValue={projectNewCodeDefinition?.value}
                onCancel={resetStatesFromProjectNewCodeDefinition}
                onSelectDays={setNumberOfDays}
                onSelectReferenceBranch={setReferenceBranch}
                onSelectSetting={setSelectedNewCodeDefinitionType}
                onSubmit={onSubmit}
                onToggleSpecificSetting={setIsSpecificNewCodeDefinition}
                overrideGlobalNewCodeDefinition={isSpecificNewCodeDefinition}
                previousNonCompliantValue={projectNewCodeDefinition?.previousNonCompliantValue}
                projectNcdUpdatedAt={projectNewCodeDefinition?.updatedAt}
                referenceBranch={referenceBranch}
                saving={isSaving}
                selectedNewCodeDefinitionType={selectedNewCodeDefinitionType}
              />
            )}

            {globalNewCodeDefinition && branchSupportEnabled && isDefined(addons.branches) && (
              <addons.branches.BranchListSection
                branchList={branchList}
                component={component}
                globalNewCodeDefinition={globalNewCodeDefinition}
                projectNewCodeDefinition={projectNewCodeDefinition ?? globalNewCodeDefinition}
              />
            )}
          </div>
        </Spinner>
      </PageContentFontWrapper>
    </LargeCenteredLayout>
  );
}

export default withComponentContext(
  withAvailableFeatures(withAppStateContext(withBranchLikes(ProjectNewCodeDefinitionApp))),
);
