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
  Badge,
  BadgeVariety,
  Button,
  ButtonVariety,
  Card,
  cssVar,
  Divider,
  Heading,
  HeadingSize,
  IconCheckCircle,
  IconRecommended,
  LinkStandalone,
  Spinner,
  Text,
  TextSize,
} from '@sonarsource/echoes-react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Switch } from '~adapters/components/common/Switch';
import { useAutoImportToggle } from '~adapters/helpers/useAutoImportToggle';
import { JourneyState, JourneyStep } from '../../../types/types';
import { PanelDonut, PanelDonutSegment } from '../charts/PanelDonut';
import { ImportRepositoriesModal } from '../modals/ImportRepositoriesModal';

interface Props {
  onSelectStep: (step: JourneyStep) => void;
  state: JourneyState;
}

/**
 * "Import repositories" detail panel. Left: a donut of imported vs not-yet-imported repositories.
 * Right: a breakdown of repositories still to import (before any import) or the auto-import control
 * (once at least one repository has been imported). All CTAs are non-functional this pass.
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
        centerPercent={importedPct}
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

        {imported === 0 ? (
          <RepositoriesToImport notYetImported={notYetImported} />
        ) : (
          <AutoImportRow />
        )}

        <Divider className="sw-max-w-[650px]" />

        <div className="sw-flex sw-gap-2">
          <Button variety={ButtonVariety.Primary}>
            {formatMessage({ id: 'onboarding_dashboard.journey.import.cta' })}
          </Button>
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

/**
 * The pre-import breakdown of repositories waiting to be imported. The overview does not expose an
 * active/stale/archived split yet, so only the "active" count is real; stale/archived are 0.
 */
function RepositoriesToImport({ notYetImported }: Readonly<{ notYetImported: number }>) {
  const { formatMessage } = useIntl();

  const chips = [
    { id: 'onboarding_dashboard.journey.import.active', count: notYetImported },
    { id: 'onboarding_dashboard.journey.import.stale', count: 0 },
    { id: 'onboarding_dashboard.journey.import.archived', count: 0 },
  ];

  return (
    <div className="sw-flex sw-flex-col sw-gap-2">
      <Text isSubtle>{formatMessage({ id: 'onboarding_dashboard.journey.import.to_import' })}</Text>
      <div className="sw-flex sw-flex-wrap sw-gap-2">
        {chips.map((chip) => (
          <Badge key={chip.id} variety={BadgeVariety.Neutral}>
            <FormattedMessage
              id={chip.id}
              values={{ b: (chunks) => <Text isHighlighted>{chunks}</Text>, count: chip.count }}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
}

/**
 * The "automatically import new repositories" control shown once importing began. Organizations
 * that already had the setting on when the panel loaded get a compact confirmation instead of a
 * control they have no reason to touch, until they click "Edit" to reveal the toggle anyway.
 */
function AutoImportRow() {
  const { formatMessage } = useIntl();
  const autoImportLabel = formatMessage({ id: 'onboarding_dashboard.journey.import.auto' });

  const {
    autoImportEnabled,
    isEnabledOnFirstLoad,
    isLoading,
    isPending,
    toggleAutoImport,
    repositoryAccessUrl,
  } = useAutoImportToggle();

  // Revealing the toggle saves nothing, so this disclosure is the panel's own business.
  const [hasClickedEdit, setHasClickedEdit] = useState(false);

  if (!isLoading && !toggleAutoImport) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="sw-max-w-[650px]">
        <Card.Body>
          <Spinner isLoading />
        </Card.Body>
      </Card>
    );
  }

  if (isEnabledOnFirstLoad && !hasClickedEdit) {
    return (
      <Card className="sw-max-w-[650px]">
        <Card.Body className="sw-flex sw-items-center sw-gap-2">
          <IconCheckCircle color="echoes-color-icon-success" />
          <Text isHighlighted>{autoImportLabel}</Text>
          <Button
            ariaLabel={formatMessage({
              id: 'onboarding_dashboard.journey.import.auto_edit_aria_label',
            })}
            className="sw-ml-auto"
            onClick={() => {
              setHasClickedEdit(true);
            }}
            variety={ButtonVariety.PrimaryGhost}
          >
            {formatMessage({ id: 'edit' })}
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="sw-max-w-[650px]">
      <Card.Body className="sw-flex sw-items-center sw-justify-between">
        <div className="sw-flex sw-flex-col sw-gap-4">
          <span className="sw-flex sw-min-w-0 sw-items-center sw-gap-2">
            <IconRecommended color="echoes-color-icon-accent" isFilled />
            <Text isHighlighted>{autoImportLabel}</Text>
            <Badge variety={BadgeVariety.Highlight}>
              {formatMessage({ id: 'onboarding_dashboard.journey.import.recommended' })}
            </Badge>
          </span>

          <Text as="p" isSubtle size={TextSize.Small}>
            <FormattedMessage
              id="onboarding_dashboard.journey.import.auto_help"
              values={{
                link: (chunks) =>
                  repositoryAccessUrl ? (
                    <LinkStandalone enableOpenInNewTab to={repositoryAccessUrl}>
                      {chunks}
                    </LinkStandalone>
                  ) : (
                    <>{chunks}</>
                  ),
              }}
            />
          </Text>
        </div>
        <Switch
          ariaLabel={autoImportLabel}
          disabled={isPending || isLoading}
          onChange={toggleAutoImport}
          value={autoImportEnabled}
        />
      </Card.Body>
    </Card>
  );
}
