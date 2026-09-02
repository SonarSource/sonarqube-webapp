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
  Button,
  ButtonVariety,
  cssVar,
  Divider,
  Heading,
  HeadingSize,
  Text,
} from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { ImportRepositoriesCta } from '~adapters/components/onboarding/ImportRepositoriesCta';
import { ImportRepositoriesExtraCard } from '~adapters/components/onboarding/ImportRepositoriesExtraCard';
import { JourneyState, JourneyStep } from '~shared/types/onboarding';
import { PanelDonut, PanelDonutSegment } from '../charts/PanelDonut';
import { ImportRepositoriesModal } from '../modals/ImportRepositoriesModal';

interface Props {
  onSelectStep: (step: JourneyStep) => void;
  state: JourneyState;
}

/**
 * "Import repositories" detail panel. Left: a donut of imported vs not-yet-imported repositories.
 * Right: the product's extra import card (auto-import toggle on SQC, CLI bulk-import card on SQS),
 * which is told whether everything is already imported.
 */
export function ImportRepositoriesPanel({ onSelectStep, state }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const { discovered, imported, importedPct, notYetImported } = state;

  const segments: PanelDonutSegment[] = [
    ...(imported > 0
      ? [
          {
            color: cssVar('color-background-success-default'),
            label: formatMessage({ id: 'onboarding_dashboard.journey.import.legend.imported' }),
            value: imported,
          },
        ]
      : []),
    {
      color: cssVar('color-background-neutral-subtle-default'),
      label: formatMessage({ id: 'onboarding_dashboard.journey.import.legend.not_imported' }),
      value: notYetImported,
    },
  ];

  return (
    <div className="sw-flex sw-items-start sw-gap-8">
      <PanelDonut
        centerLabel={formatMessage(
          { id: 'onboarding_dashboard.percent' },
          { percent: importedPct },
        )}
        centerSubLabel={formatMessage(
          { id: 'onboarding_dashboard.journey.step.count' },
          { done: imported, total: discovered },
        )}
        segments={segments}
        viewAll={
          <ImportRepositoriesModal>
            <Button variety={ButtonVariety.PrimaryGhost}>
              {formatMessage({ id: 'onboarding_dashboard.journey.import.view_all' })}
            </Button>
          </ImportRepositoriesModal>
        }
      />

      <div className="sw-flex sw-min-w-0 sw-flex-1 sw-flex-col sw-gap-4">
        <Heading as="h3" size={HeadingSize.Small}>
          {formatMessage({ id: 'onboarding_dashboard.journey.import.title' })}
        </Heading>

        <Text as="p" isSubtle>
          {formatMessage({ id: 'onboarding_dashboard.journey.import.description' })}
        </Text>

        <ImportRepositoriesExtraCard isFullyImported={notYetImported === 0} />

        <Divider className="sw-max-w-[650px]" />

        <div className="sw-flex sw-gap-2">
          <ImportRepositoriesCta variety={ButtonVariety.Primary}>
            {formatMessage({ id: 'onboarding_dashboard.journey.import.cta' })}
          </ImportRepositoriesCta>
          <Button
            onClick={() => {
              onSelectStep(JourneyStep.Projects);
            }}
            variety={ButtonVariety.Default}
          >
            {formatMessage({ id: 'next' })}
          </Button>
        </div>
      </div>
    </div>
  );
}
