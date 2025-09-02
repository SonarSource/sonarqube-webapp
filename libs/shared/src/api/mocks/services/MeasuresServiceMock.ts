/*
 * SonarQube
 * Copyright (C) 2009-2025 SonarSource SA
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

import { DefaultBodyType, http, StrictRequest } from 'msw';
import { mockComponent } from '../../../helpers/mocks/component';
import { isDefined } from '../../../helpers/types';
import { MeasuresByComponents, Period } from '../../../types/measures';
import { MetricKey } from '../../../types/metrics';
import { AbstractServiceMock } from '../AbstractServiceMock';
import { ComponentTree, mockComponentTree } from '../data/measures';

export interface MeasuresServiceData {
  components: ReturnType<typeof mockComponentTree>[];
  componentsKeysToIdsRelation: Record<string, string>;
  measuresByComponent: Record<string, MeasuresByComponents[]>;
  periods?: Period[];
}
export class MeasuresServiceMock extends AbstractServiceMock<MeasuresServiceData> {
  handlers = [
    http.get('/api/measures/component', ({ request }) => {
      const url = new URL(request.url);
      const metricKeys = url.searchParams.get('metricKeys');
      const tree = this.findComponent(request);

      if (tree) {
        const requiredMetrics = metricKeys?.split(',') ?? [];
        const filteredMeasure = this.data.measuresByComponent[tree.component.key].filter((m) =>
          requiredMetrics.includes(m.metric),
        );

        return this.ok({
          component: { ...tree.component, measures: filteredMeasure },
          periods: this.data.periods,
        });
      }

      return this.errors(`Component key: ${url.searchParams.get('component')} not found`);
    }),
  ];

  findComponent(request: StrictRequest<DefaultBodyType>) {
    const params = this.getQueryParams(request);
    const component = params.get('component');

    const recurse = (node: ComponentTree): ComponentTree | undefined => {
      if (node.component.key === component) {
        return node;
      }
      return node.children.map((child) => recurse(child)).filter(isDefined)[0];
    };
    const components = this.data.components.map((child) => recurse(child)).filter(isDefined);

    return components[0];
  }
}

export const PeriodDefaultDataset: Period[] = [
  {
    index: 1,
    mode: 'days',
    date: '2023-12-01T00:00:00',
    parameter: '30',
  },
];

const COMPONENT_FOO = mockComponent({ key: 'foo' });
const COMPONENT_BAR = mockComponent({ key: 'bar' });
const COMPONENT_BAZ = mockComponent({ key: 'baz' });

export const MeasuresServiceDefaultDataset: MeasuresServiceData = {
  components: [
    mockComponentTree(COMPONENT_FOO),
    mockComponentTree(COMPONENT_BAR),
    mockComponentTree(COMPONENT_BAZ),
  ],
  measuresByComponent: {
    [COMPONENT_FOO.key]: [
      { metric: MetricKey.alert_status, value: 'OK', component: COMPONENT_FOO.key },
      { metric: MetricKey.bugs, value: '0', component: COMPONENT_FOO.key },
      { metric: MetricKey.code_smells, value: '14', component: COMPONENT_FOO.key },
      { metric: MetricKey.open_issues, value: '15', component: COMPONENT_FOO.key },
      { metric: MetricKey.issues, value: '15', component: COMPONENT_FOO.key },
      { metric: MetricKey.accepted_issues, value: '15', component: COMPONENT_FOO.key },
      { metric: MetricKey.coverage, value: '93.3', component: COMPONENT_FOO.key },
      { metric: MetricKey.duplicated_lines_density, value: '0.0', component: COMPONENT_FOO.key },
      { metric: MetricKey.ncloc, value: '32648', component: COMPONENT_FOO.key },
      { metric: MetricKey.maintainability_rating, value: '1.0', component: COMPONENT_FOO.key },
      { metric: MetricKey.reliability_rating, value: '1.0', component: COMPONENT_FOO.key },
      { metric: MetricKey.security_rating, value: '1.0', component: COMPONENT_FOO.key },
      { metric: MetricKey.security_review_rating, value: '1.0', component: COMPONENT_FOO.key },
      {
        metric: MetricKey.ncloc_language_distribution,
        value: 'java=170940;py=2229;xml=182;yaml=7282',
        component: COMPONENT_FOO.key,
      },

      {
        metric: MetricKey.complexity,
        value: '105',
        component: COMPONENT_FOO.key,
      },
      {
        metric: MetricKey.new_lines,
        periods: [{ index: 1, value: '23564' }],
        component: COMPONENT_FOO.key,
      },
      {
        metric: MetricKey.new_bugs,
        periods: [{ index: 1, value: '1', bestValue: false }],
        component: COMPONENT_FOO.key,
      },
      {
        metric: MetricKey.new_code_smells,
        periods: [{ index: 1, value: '19', bestValue: false }],
        component: COMPONENT_FOO.key,
      },
      {
        metric: MetricKey.new_vulnerabilities,
        periods: [{ index: 1, value: '0', bestValue: true }],
        component: COMPONENT_FOO.key,
      },
      {
        metric: MetricKey.new_coverage,
        periods: [{ index: 1, value: '99.4', bestValue: false }],
        component: COMPONENT_FOO.key,
      },
      {
        metric: MetricKey.new_duplicated_lines_density,
        periods: [{ index: 1, value: '0.8', bestValue: false }],
        component: COMPONENT_FOO.key,
      },
      {
        metric: MetricKey.new_maintainability_rating,
        periods: [{ index: 1, value: '1.0', bestValue: true }],
        component: COMPONENT_FOO.key,
      },
      {
        metric: MetricKey.new_reliability_rating,
        periods: [{ index: 1, value: '3.0', bestValue: false }],
        component: COMPONENT_FOO.key,
      },
      {
        metric: MetricKey.new_security_hotspots_reviewed,
        periods: [{ index: 1, value: '100.0', bestValue: true }],
        component: COMPONENT_FOO.key,
      },
      {
        metric: MetricKey.new_security_rating,
        periods: [{ index: 1, value: '1.0', bestValue: true }],
        component: COMPONENT_FOO.key,
      },
      {
        metric: MetricKey.new_security_review_rating,
        periods: [{ index: 1, value: '1.0', bestValue: true }],
        component: COMPONENT_FOO.key,
      },
      {
        metric: MetricKey.maintainability_issues,
        value: '{"total":14,"HIGH":14,"MEDIUM":0,"LOW":0}',
        component: COMPONENT_FOO.key,
      },
      {
        metric: MetricKey.security_issues,
        value: '{"total":1,"HIGH":1,"MEDIUM":0,"LOW":0}',
        component: COMPONENT_FOO.key,
      },
      {
        metric: MetricKey.reliability_issues,
        value: '{"total":5,"HIGH":5,"MEDIUM":0,"LOW":0}',
        component: COMPONENT_FOO.key,
      },
      {
        metric: MetricKey.new_violations,
        periods: [
          {
            index: 1,
            value: '0',
            bestValue: true,
          },
        ],
        component: COMPONENT_FOO.key,
      },
    ],
    [COMPONENT_BAR.key]: [
      { metric: MetricKey.alert_status, value: 'ERROR', component: COMPONENT_BAR.key },
      { metric: MetricKey.bugs, value: '105', component: COMPONENT_BAR.key },
      { metric: MetricKey.code_smells, value: '6739', component: COMPONENT_BAR.key },
      { metric: MetricKey.duplicated_lines_density, value: '6.0', component: COMPONENT_BAR.key },
      { metric: MetricKey.ncloc, value: '342', component: COMPONENT_BAR.key },
      { metric: MetricKey.new_lines, value: '342', component: COMPONENT_BAR.key },
      { metric: MetricKey.vulnerabilities, value: '1', component: COMPONENT_BAR.key },
      { metric: MetricKey.security_hotspots_reviewed, value: '98.7', component: COMPONENT_BAR.key },
      { metric: MetricKey.coverage, value: '88.2', component: COMPONENT_BAR.key },
      { metric: MetricKey.duplicated_lines_density, value: '0.3', component: COMPONENT_BAR.key },
    ],
    [COMPONENT_BAZ.key]: [
      { metric: MetricKey.bugs, value: '0', component: COMPONENT_BAZ.key },
      { metric: MetricKey.code_smells, value: '1', component: COMPONENT_BAZ.key },
      { metric: MetricKey.vulnerabilities, value: '2', component: COMPONENT_BAZ.key },
      { metric: MetricKey.duplicated_lines_density, value: '0.0', component: COMPONENT_BAZ.key },
      { metric: MetricKey.alert_status, value: 'OK', component: COMPONENT_BAZ.key },
      { metric: MetricKey.ncloc, value: '342', component: COMPONENT_BAZ.key },
      { metric: MetricKey.new_lines, value: '342', component: COMPONENT_BAZ.key },
    ],
  },
  componentsKeysToIdsRelation: {
    fooId: COMPONENT_FOO.key,
    barId: COMPONENT_BAR.key,
    bazId: COMPONENT_BAZ.key,
  },
};
