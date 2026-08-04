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

import { To } from 'react-router-dom';
import { SharedDocLink, useSharedDocUrl } from '~adapters/helpers/docs';
import {
  getProjectCiConfigurationUrl,
  useProjectImportUrl,
} from '~adapters/helpers/onboarding-actions';
import { isDefined } from '~shared/helpers/types';
import { getProjectOverviewUrl } from '~shared/helpers/urls';
import { OnboardingProject } from '~shared/types/onboarding';
import { useRerunAutomaticAnalysisMutation } from './projectRowActionMutations';
import { getProjectRowActions, ProjectRowAction } from './projectRowActions';

/** What activating a row menu entry does: navigate somewhere, or run something. */
type ProjectRowActionTarget =
  { isExternal?: boolean; kind: 'link'; to: To } | { kind: 'button'; onClick: VoidFunction };

export type ProjectRowActionItem = ProjectRowActionTarget & { action: ProjectRowAction };

interface Options {
  /** Opens the confirmation modal of the "Restore access" action, which the cell owns. */
  onRestoreAccess: VoidFunction;
}

/**
 * Turns the actions {@link getProjectRowActions} offers for a project into ready-to-render row menu
 * entries.
 *
 * An action the row cannot actually perform — because the product doesn't support it, or because the
 * repository has no project in SonarQube yet — is dropped rather than shown disabled, so the menu
 * never offers a dead end. Adding a new action means adding a builder below and a label key, not
 * another branch in the cell.
 */
export function useProjectRowActionItems(
  project: OnboardingProject,
  { onRestoreAccess }: Readonly<Options>,
): ProjectRowActionItem[] {
  const importUrl = useProjectImportUrl(project.alm);
  const scanDocUrl = useSharedDocUrl(SharedDocLink.CIAnalysisSetup);
  const rerunAutomaticAnalysis = useRerunAutomaticAnalysisMutation();

  const { key: projectKey } = project;

  const itemTargets: Record<ProjectRowAction, () => ProjectRowActionTarget | undefined> = {
    [ProjectRowAction.ConfigureCi]: () =>
      projectKey === null
        ? undefined
        : { kind: 'link', to: getProjectCiConfigurationUrl(projectKey) },

    [ProjectRowAction.HowToRunNewScan]: () => ({ isExternal: true, kind: 'link', to: scanDocUrl }),

    [ProjectRowAction.ImportRepository]: () => ({ kind: 'link', to: importUrl }),

    [ProjectRowAction.RerunAutomaticAnalysis]: () =>
      projectKey === null || rerunAutomaticAnalysis === undefined
        ? undefined
        : {
            kind: 'button',
            onClick: () => {
              rerunAutomaticAnalysis.mutate(projectKey);
            },
          },

    [ProjectRowAction.RestoreAccess]: () =>
      projectKey === null ? undefined : { kind: 'button', onClick: onRestoreAccess },

    [ProjectRowAction.ViewProject]: () =>
      projectKey === null ? undefined : { kind: 'link', to: getProjectOverviewUrl(projectKey) },
  };

  return getProjectRowActions(project)
    .map((action) => {
      const target = itemTargets[action]();

      return target === undefined ? undefined : { ...target, action };
    })
    .filter(isDefined);
}
