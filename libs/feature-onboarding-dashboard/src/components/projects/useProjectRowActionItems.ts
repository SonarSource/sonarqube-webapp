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
import { PROJECT_ALM_BINDING_SETTINGS_CATEGORY } from '~adapters/helpers/urls';
import { isDefined } from '~shared/helpers/types';
import { getProjectOverviewUrl, getProjectSettingsUrl } from '~shared/helpers/urls';
import { useComponentConfigurationQuery } from '~shared/queries/navigation';
import { OnboardingProject } from '~shared/types/onboarding';
import { RowActionKind, RowActionTarget } from '../../types/types';
import { useRerunAutomaticAnalysisMutation } from './projectRowActionMutations';
import { getProjectRowActions, ProjectRowAction } from './projectRowActions';

export type ProjectRowActionItem = RowActionTarget & { action: ProjectRowAction };

interface Options {
  /** Whether the access of the reader may be looked up — see {@link useProjectRowActionItems}. */
  shouldCheckAccess: boolean;

  /** Opens the confirmation modal of the "Restore access" action, which the cell owns. */
  onRestoreAccess: VoidFunction;
}

/**
 * Turns the actions {@link getProjectRowActions} offers for a project into ready-to-render row menu
 * entries.
 *
 * An action the row cannot actually perform — because the product doesn't support it, or because
 * the reader has nothing to gain from it — is dropped rather than shown disabled, so the menu never
 * offers a dead end. Adding a new action means adding a builder below and a label key, not another
 * branch in the cell.
 *
 * Whether the reader still has access is the one thing that has to be asked of the server, so the
 * caller decides when it is worth asking: never before the row menu is opened, and never when the
 * only action it gates is dropped anyway.
 */
export function useProjectRowActionItems(
  project: OnboardingProject,
  { onRestoreAccess, shouldCheckAccess }: Readonly<Options>,
): ProjectRowActionItem[] {
  const scanDocUrl = useSharedDocUrl(SharedDocLink.CIAnalysisSetup);
  const rerunAutomaticAnalysis = useRerunAutomaticAnalysisMutation();

  const { key: projectKey } = project;

  const { data: hasProjectAccess } = useComponentConfigurationQuery(projectKey, {
    enabled: shouldCheckAccess,
    select: (configuration) =>
      Boolean(configuration.showPermissions && configuration.canBrowseProject),
  });

  const itemTargets: Record<ProjectRowAction, () => RowActionTarget | undefined> = {
    [ProjectRowAction.BindProject]: () => ({
      kind: RowActionKind.Link,
      to: getProjectSettingsUrl(projectKey, PROJECT_ALM_BINDING_SETTINGS_CATEGORY),
    }),

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

    // Offered only to a reader known to have lost access — access, or an answer that never came
    // back, leaves nothing to restore.
    [ProjectRowAction.RestoreAccess]: () =>
      hasProjectAccess === false
        ? {
            kind: RowActionKind.Button,
            onClick: onRestoreAccess,
          }
        : undefined,

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
