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

import { Heading, HeadingSize, Text } from '@sonarsource/echoes-react';
import { ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { JourneyEnterpriseState, JourneyState, JourneyStep } from '~shared/types/onboarding';
import { PanelDonut } from '../journey/charts/PanelDonut';
import { DevopsConfigurationsDonut } from '../journey/panels/DevopsConfigurationsDonut';
import { getAnalyzeSegments, getImportSegments } from '../journey/panels/panelSegments';

interface Props {
  enterprise: JourneyEnterpriseState;
  selectedStep: JourneyStep;
  state: JourneyState;
}

/**
 * Read-only detail panel of an enterprise step: each organization is bound, imported or analyzed
 * from the table below.
 */
export function EnterpriseDetailPanel({ enterprise, selectedStep, state }: Readonly<Props>) {
  switch (selectedStep) {
    case JourneyStep.Binding:
      return <EnterpriseBindingPanel enterprise={enterprise} />;
    case JourneyStep.Repositories:
      return <EnterpriseImportPanel state={state} />;
    case JourneyStep.Projects:
      return <EnterpriseAnalyzePanel state={state} />;
  }
}

function PanelText({
  children,
  descriptionId,
  titleId,
}: Readonly<{ children?: ReactNode; descriptionId: string; titleId: string }>) {
  const { formatMessage } = useIntl();

  return (
    <div className="sw:flex sw:min-w-0 sw:flex-1 sw:flex-col sw:gap-4 sw:py-4">
      <div className="sw:flex sw:flex-col sw:gap-2">
        <Heading as="h3" size={HeadingSize.Medium}>
          {formatMessage({ id: titleId })}
        </Heading>

        <Text as="p" isSubtle>
          {formatMessage({ id: descriptionId })}
        </Text>
      </div>

      {children}
    </div>
  );
}

function EnterpriseBindingPanel({ enterprise }: Readonly<{ enterprise: JourneyEnterpriseState }>) {
  const { formatMessage } = useIntl();
  const { byPlatform, organizationsBound, organizationsTotal } = enterprise;

  return (
    <div className="sw:flex sw:items-start sw:gap-8">
      <DevopsConfigurationsDonut
        byPlatform={byPlatform}
        centerSubLabelId="onboarding_dashboard.enterprise.binding.bound_label"
        configured={organizationsBound}
        unboundCount={Math.max(organizationsTotal - organizationsBound, 0)}
      />

      <PanelText
        descriptionId="onboarding_dashboard.enterprise.binding.description"
        titleId="onboarding_dashboard.enterprise.binding.title"
      >
        <Text isHighlighted>
          {formatMessage(
            { id: 'onboarding_dashboard.enterprise.step.binding.count' },
            { bound: organizationsBound, total: organizationsTotal },
          )}
        </Text>
      </PanelText>
    </div>
  );
}

function EnterpriseImportPanel({ state }: Readonly<{ state: JourneyState }>) {
  const { formatMessage } = useIntl();

  return (
    <div className="sw:flex sw:items-start sw:gap-8">
      <PanelDonut
        centerLabel={formatMessage(
          { id: 'onboarding_dashboard.percent' },
          { percent: state.importedPct },
        )}
        centerSubLabel={formatMessage({
          id: 'onboarding_dashboard.journey.import.imported_label',
        })}
        segments={getImportSegments(state, formatMessage)}
      />

      <PanelText
        descriptionId="onboarding_dashboard.enterprise.import.description"
        titleId="onboarding_dashboard.enterprise.import.title"
      >
        <Text isHighlighted>
          {formatMessage(
            { id: 'onboarding_dashboard.enterprise.import.summary' },
            { discovered: state.discovered, imported: state.imported },
          )}
        </Text>
      </PanelText>
    </div>
  );
}

function EnterpriseAnalyzePanel({ state }: Readonly<{ state: JourneyState }>) {
  const { formatMessage } = useIntl();

  return (
    <div className="sw:flex sw:items-start sw:gap-8">
      <PanelDonut
        centerLabel={formatMessage(
          { id: 'onboarding_dashboard.percent' },
          { percent: state.analyzedPct },
        )}
        centerSubLabel={formatMessage({
          id: 'onboarding_dashboard.journey.analyze.analyzed_label',
        })}
        segments={getAnalyzeSegments(state, formatMessage)}
      />

      <PanelText
        descriptionId="onboarding_dashboard.enterprise.analyze.description"
        titleId="onboarding_dashboard.enterprise.analyze.title"
      >
        <Text isHighlighted>
          {formatMessage(
            { id: 'onboarding_dashboard.enterprise.analyze.summary' },
            { analyzed: state.analyzed, total: state.totalProjects },
          )}
        </Text>
      </PanelText>
    </div>
  );
}
