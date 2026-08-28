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

import { SharedDocLink, useSharedDocUrl } from '~adapters/helpers/docs';
import { getProjectCiConfigurationUrl } from '~adapters/helpers/onboarding-actions';
import { isDefined } from '~shared/helpers/types';
import { getProjectOverviewUrl } from '~shared/helpers/urls';
import { OnboardingProject } from '~shared/types/onboarding';
import { RowActionKind, RowActionTarget } from '../../types/types';
import { useRerunAutomaticAnalysisMutation } from './projectRowActionMutations';
import { getProjectRowActions, ProjectRowAction } from './projectRowActions';

export type ProjectRowActionItem = RowActionTarget & { action: ProjectRowAction };

interface Options {
  /** Opens the confirmation modal of the "Restore access" action, which the cell owns. */
  onRestoreAccess: VoidFunction;
}

/**
 * Turns the actions {@link getProjectRowActions} offers for a project into ready-to-render row menu
 * entries.
 *
 * An action the row cannot actually perform — because the product doesn't support it — is dropped
 * rather than shown disabled, so the menu never offers a dead end. Adding a new action means adding
 * a builder below and a label key, not another branch in the cell.
 */
export function useProjectRowActionItems(
  project: OnboardingProject,
  { onRestoreAccess }: Readonly<Options>,
): ProjectRowActionItem[] {
  const scanDocUrl = useSharedDocUrl(SharedDocLink.CIAnalysisSetup);
  const rerunAutomaticAnalysis = useRerunAutomaticAnalysisMutation();

  const { key: projectKey } = project;

  const itemTargets: Record<ProjectRowAction, () => RowActionTarget | undefined> = {
    [ProjectRowAction.ConfigureCi]: () => ({
      kind: RowActionKind.Link,
      to: getProjectCiConfigurationUrl(projectKey),
    }),

    [ProjectRowAction.HowToRunNewScan]: () => ({
      isExternal: true,
      kind: RowActionKind.Link,
      to: scanDocUrl,
    }),

    [ProjectRowAction.RerunAutomaticAnalysis]: () =>
      rerunAutomaticAnalysis === undefined
        ? undefined
        : {
            kind: RowActionKind.Button,
            onClick: () => {
              rerunAutomaticAnalysis.mutate(projectKey);
            },
          },

    [ProjectRowAction.RestoreAccess]: () => ({
      kind: RowActionKind.Button,
      onClick: onRestoreAccess,
    }),

    [ProjectRowAction.ViewProject]: () => ({
      kind: RowActionKind.Link,
      to: getProjectOverviewUrl(projectKey),
    }),
  };

  return getProjectRowActions(project)
    .map((action) => {
      const target = itemTargets[action]();

      return target === undefined ? undefined : { ...target, action };
    })
    .filter(isDefined);
}
