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

import { useIntl } from 'react-intl';
import {
  getDevopsPlatformWebUrl,
  getImportRepositoriesUrl,
} from '~adapters/helpers/onboarding-actions';
import { isDefined } from '~shared/helpers/types';
import { JourneyStep, RowActionKind, RowActionTarget } from '../../../types/types';
import { PLATFORM_CONFIG } from '../../devops/platformConfig';
import {
  DevopsConfigurationRowAction,
  getDevopsConfigurationRowActions,
} from './devopsConfigurationRowActions';
import { DevopsConfigurationRow } from './devopsConfigurationRows';

export type DevopsConfigurationRowActionItem = RowActionTarget & {
  action: DevopsConfigurationRowAction;
  /** Values for the label's placeholders, for the entries that name their platform. */
  labelValues?: Record<string, string>;
};

interface Options {
  /** Moves the dashboard to another step of the journey, and closes the modal on the way. */
  onGoToStep: (step: JourneyStep) => void;
}

// An action the row cannot perform is dropped rather than shown disabled, so the menu never offers a
// dead end. Adding one means a builder below plus a label key, not another branch in the cell.
export function useDevopsConfigurationRowActionItems(
  row: DevopsConfigurationRow,
  { onGoToStep }: Readonly<Options>,
): DevopsConfigurationRowActionItem[] {
  const { formatMessage } = useIntl();

  const { alm, id, url } = row;

  const itemTargets: Record<
    DevopsConfigurationRowAction,
    () => (RowActionTarget & { labelValues?: Record<string, string> }) | undefined
  > = {
    [DevopsConfigurationRowAction.ImportRepositories]: () => {
      const to = getImportRepositoriesUrl(alm, id);

      return to === undefined ? undefined : { kind: RowActionKind.Link, to };
    },

    // Sends the user to the "Analyze your projects" step rather than analysing anything: SQ-Server
    // has no bulk analysis, and no project view can be narrowed to a single DevOps configuration.
    [DevopsConfigurationRowAction.AnalyzeProjects]: () => ({
      kind: RowActionKind.Button,
      onClick: () => {
        onGoToStep(JourneyStep.Projects);
      },
    }),

    [DevopsConfigurationRowAction.ViewOnPlatform]: () => {
      const webUrl = getDevopsPlatformWebUrl(alm, url);

      return webUrl === undefined
        ? undefined
        : {
            isExternal: true,
            kind: RowActionKind.Link,
            labelValues: { platform: formatMessage({ id: PLATFORM_CONFIG[alm].labelKey }) },
            to: webUrl,
          };
    },
  };

  return getDevopsConfigurationRowActions()
    .map((action) => {
      const target = itemTargets[action]();

      return target === undefined ? undefined : { ...target, action };
    })
    .filter(isDefined);
}
