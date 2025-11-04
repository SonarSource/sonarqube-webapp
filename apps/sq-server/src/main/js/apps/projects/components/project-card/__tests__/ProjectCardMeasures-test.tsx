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

import { screen } from '@testing-library/react';
import { ComponentQualifier } from '~shared/types/component';
import { MetricKey } from '~shared/types/metrics';
import { MeasuresServiceMock } from '~sq-server-commons/api/mocks/MeasuresServiceMock';
import { ModeServiceMock } from '~sq-server-commons/api/mocks/ModeServiceMock';
import { AvailableFeaturesContext } from '~sq-server-commons/context/available-features/AvailableFeaturesContext';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { Feature } from '~sq-server-commons/types/features';
import { Mode } from '~sq-server-commons/types/mode';
import ProjectCardMeasures, { ProjectCardMeasuresProps } from '../ProjectCardMeasures';

jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  differenceInMilliseconds: () => 1000 * 60 * 60 * 24 * 30 * 8, // ~ 8 months
}));

const measuresHandler = new MeasuresServiceMock();
const modeHandler = new ModeServiceMock();

beforeEach(() => {
  measuresHandler.reset();
  modeHandler.reset();
});

describe('Overall measures', () => {
  it('should be rendered properly', async () => {
    renderProjectCardMeasures();
    expect(
      await screen.findByTitle('metric.software_quality_security_issues.short_name'),
    ).toBeInTheDocument();
    expect(
      screen.getByTitle('metric.software_quality_reliability_issues.short_name'),
    ).toBeInTheDocument();
    expect(
      screen.getByTitle('metric.software_quality_maintainability_issues.short_name'),
    ).toBeInTheDocument();
    expect(screen.queryByTitle('dependencies.risks')).not.toBeInTheDocument();
    expect(screen.queryByTitle('metric.vulnerabilities.short_name')).not.toBeInTheDocument();
    expect(screen.queryByTitle('metric.bugs.short_name')).not.toBeInTheDocument();
    expect(screen.queryByTitle('metric.code_smells.short_name')).not.toBeInTheDocument();
  });

  it('should be rendered properly when SCA is active', () => {
    renderProjectCardMeasures({}, {}, [Feature.Sca]);
    expect(screen.getByTitle('dependencies.risks')).toBeInTheDocument();
  });

  it('should be rendered properly in Standard mode', async () => {
    modeHandler.setMode(Mode.Standard);
    renderProjectCardMeasures();
    expect(await screen.findByTitle('metric.vulnerabilities.short_name')).toBeInTheDocument();
    expect(screen.getByTitle('metric.bugs.short_name')).toBeInTheDocument();
    expect(screen.getByTitle('metric.code_smells.short_name')).toBeInTheDocument();
    expect(
      screen.queryByTitle('metric.software_quality_security_issues.short_name'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTitle('metric.software_quality_software_quality_reliability_issues.short_name'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTitle('metric.software_quality_maintainability_issues.short_name'),
    ).not.toBeInTheDocument();
  });

  it("should be not be rendered if there's no line of code", () => {
    renderProjectCardMeasures({ [MetricKey.ncloc]: undefined });
    expect(screen.getByText('overview.project.main_branch_empty')).toBeInTheDocument();
  });

  it("should be not be rendered if there's no line of code and application", () => {
    renderProjectCardMeasures(
      { [MetricKey.ncloc]: undefined },
      { componentQualifier: ComponentQualifier.Application },
    );
    expect(screen.getByText('portfolio.app.empty')).toBeInTheDocument();
  });
});

describe('New code measures', () => {
  it('should be rendered properly', () => {
    renderProjectCardMeasures({}, { isNewCode: true });
    expect(screen.getByTitle('metric.new_violations.description')).toBeInTheDocument();
    expect(screen.queryByTitle('dependencies.risks')).not.toBeInTheDocument();
  });

  it('should be rendered properly when SCA is active', () => {
    renderProjectCardMeasures({}, { isNewCode: true }, [Feature.Sca]);
    expect(screen.getByTitle('dependencies.risks')).toBeInTheDocument();
  });
});

function renderProjectCardMeasures(
  measuresOverride: Record<string, string | undefined> = {},
  props: Partial<ProjectCardMeasuresProps> = {},
  features: Feature[] = [],
) {
  const measures = {
    [MetricKey.alert_status]: 'ERROR',
    [MetricKey.bugs]: '17',
    [MetricKey.code_smells]: '132',
    [MetricKey.coverage]: '88.3',
    [MetricKey.duplicated_lines_density]: '9.8',
    [MetricKey.software_quality_maintainability_issues]: '10',
    [MetricKey.software_quality_reliability_issues]: '10',
    [MetricKey.software_quality_security_issues]: '10',
    [MetricKey.ncloc]: '2053',
    [MetricKey.reliability_rating]: '1.0',
    [MetricKey.security_rating]: '1.0',
    [MetricKey.sqale_rating]: '1.0',
    [MetricKey.vulnerabilities]: '0',
    [MetricKey.new_reliability_rating]: '1.0',
    [MetricKey.new_bugs]: '8',
    [MetricKey.new_security_rating]: '2.0',
    [MetricKey.new_vulnerabilities]: '2',
    [MetricKey.new_maintainability_rating]: '1.0',
    [MetricKey.new_code_smells]: '0',
    [MetricKey.new_coverage]: '26.55',
    [MetricKey.new_duplicated_lines_density]: '0.55',
    [MetricKey.new_violations]: '10',
    [MetricKey.new_lines]: '87',
    [MetricKey.sca_count_any_issue]: '42',
    [MetricKey.sca_rating_any_issue]: '2.0',
    ...measuresOverride,
  };

  renderComponent(
    <AvailableFeaturesContext.Provider value={features}>
      <ProjectCardMeasures
        componentKey="test"
        componentQualifier={ComponentQualifier.Project}
        isNewCode={false}
        measures={measures}
        {...props}
      />
    </AvailableFeaturesContext.Provider>,
  );
}
