/*
 * SonarQube
 * Copyright (C) 2009-2023 SonarSource SA
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
import * as React from 'react';
import { renderComponent } from '../../../../helpers/testReactTestingUtils';
import { MetricKey } from '../../../../types/metrics';
import { CaycStatus, Status } from '../../../../types/types';
import QualityGatePanelSection, { QualityGatePanelSectionProps } from '../QualityGatePanelSection';

const failedConditions = [
  {
    level: 'ERROR' as Status,
    measure: {
      metric: {
        id: 'metricId1',
        key: 'metricKey1',
        name: 'metricName1',
        type: 'metricType1',
      },
    },
    metric: MetricKey.new_coverage,
    op: 'op1',
  },
  {
    level: 'ERROR' as Status,
    measure: {
      metric: {
        id: 'metricId2',
        key: 'metricKey2',
        name: 'metricName2',
        type: 'metricType2',
      },
    },
    metric: MetricKey.security_hotspots,
    op: 'op2',
  },
];

const qgStatus = {
  caycStatus: CaycStatus.Compliant,
  failedConditions,
  key: 'qgStatusKey',
  name: 'qgStatusName',
  status: 'ERROR' as Status,
};

it('should render correctly for an application with 1 new code condition and 1 overall code condition', async () => {
  renderQualityGatePanelSection();

  expect(await screen.findByText('quality_gates.conditions.new_code_1')).toBeInTheDocument();
  expect(await screen.findByText('quality_gates.conditions.overall_code_1')).toBeInTheDocument();
});

it('should render correctly for a project with 1 new code condition', () => {
  renderQualityGatePanelSection({
    isApplication: false,
    qgStatus: { ...qgStatus, failedConditions: [failedConditions[0]] },
  });

  expect(screen.queryByText('quality_gates.conditions.new_code_1')).not.toBeInTheDocument();
  expect(screen.queryByText('quality_gates.conditions.overall_code_1')).not.toBeInTheDocument();
});

function renderQualityGatePanelSection(props: Partial<QualityGatePanelSectionProps> = {}) {
  return renderComponent(<QualityGatePanelSection isApplication qgStatus={qgStatus} {...props} />);
}
