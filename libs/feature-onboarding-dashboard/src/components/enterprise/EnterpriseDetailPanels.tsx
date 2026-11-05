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
import { ViewAllOrganizationsButton } from './ViewAllOrganizationsButton';
import { formatCompactCount } from './formatCompactCount';

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
      return <EnterpriseImportPanel enterprise={enterprise} state={state} />;
    case JourneyStep.Projects:
      return <EnterpriseAnalyzePanel enterprise={enterprise} state={state} />;
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
        viewAll={<ViewAllOrganizationsButton />}
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

function EnterpriseImportPanel({
  enterprise,
  state,
}: Readonly<{ enterprise: JourneyEnterpriseState; state: JourneyState }>) {
  const { formatMessage, locale } = useIntl();
  const { discovered, importedPct } = enterprise;
  const isTotalKnown = discovered !== null && importedPct !== null;

  // Without a total there is no "not imported" share to draw; a legend entry reading 0 would claim one.
  const segments = getImportSegments(state, formatMessage, { omitNotImported: !isTotalKnown });

  return (
    <div className="sw:flex sw:items-start sw:gap-8">
      <PanelDonut
        centerLabel={
          isTotalKnown
            ? formatMessage({ id: 'onboarding_dashboard.percent' }, { percent: importedPct })
            : formatCompactCount(state.imported, locale)
        }
        centerSubLabel={formatMessage({
          id: 'onboarding_dashboard.journey.import.imported_label',
        })}
        segments={segments}
        viewAll={<ViewAllOrganizationsButton />}
      />

      <PanelText
        descriptionId="onboarding_dashboard.enterprise.import.description"
        titleId="onboarding_dashboard.enterprise.import.title"
      >
        <Text isHighlighted>
          {isTotalKnown
            ? formatMessage(
                { id: 'onboarding_dashboard.enterprise.import.summary' },
                { discovered, imported: state.imported },
              )
            : formatMessage(
                { id: 'onboarding_dashboard.enterprise.import.summary_unknown' },
                { imported: state.imported },
              )}
        </Text>

        {!isTotalKnown && (
          <Text as="p" isSubtle>
            {formatMessage({ id: 'onboarding_dashboard.enterprise.import.total_unknown' })}
          </Text>
        )}
      </PanelText>
    </div>
  );
}

function EnterpriseAnalyzePanel({
  enterprise,
  state,
}: Readonly<{ enterprise: JourneyEnterpriseState; state: JourneyState }>) {
  const { formatMessage } = useIntl();
  const { analyzedPct, discovered, projectsTotal } = enterprise;

  // With the repositories still to import unknown, "not imported" is unknown, not 0.
  const segments = getAnalyzeSegments(
    { analyze: state.analyze, analyzed: state.analyzed, totalProjects: projectsTotal },
    formatMessage,
    { omitNotImported: discovered === null },
  );

  return (
    <div className="sw:flex sw:items-start sw:gap-8">
      <PanelDonut
        centerLabel={formatMessage(
          { id: 'onboarding_dashboard.percent' },
          { percent: analyzedPct },
        )}
        centerSubLabel={formatMessage({
          id: 'onboarding_dashboard.journey.analyze.analyzed_label',
        })}
        segments={segments}
        viewAll={<ViewAllOrganizationsButton />}
      />

      <PanelText
        descriptionId="onboarding_dashboard.enterprise.analyze.description"
        titleId="onboarding_dashboard.enterprise.analyze.title"
      >
        <Text isHighlighted>
          {formatMessage(
            { id: 'onboarding_dashboard.enterprise.analyze.summary' },
            { analyzed: state.analyzed, total: projectsTotal },
          )}
        </Text>
      </PanelText>
    </div>
  );
}
