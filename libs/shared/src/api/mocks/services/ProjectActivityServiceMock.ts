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

import { http } from 'msw';
import { MetricKey } from '../../../types/metrics';
import { Paging } from '../../../types/paging';
import { AbstractServiceMock } from '../AbstractServiceMock';

export interface AnalysisEvent {
  category: string;
  key: string;
  name: string;
}

export interface Analysis {
  date: string;
  events: AnalysisEvent[];
  key: string;
  manualNewCodePeriodBaseline?: boolean;
  projectVersion?: string;
}

export interface MeasureHistoryItem {
  date: string;
  value?: string;
}

export interface ProjectActivityServiceData {
  analyses: { analyses: Analysis[]; paging: Paging };
  measuresHistory: {
    measures: Array<{ history: MeasureHistoryItem[]; metric: string }>;
    paging: Paging;
  };
}

export class ProjectActivityServiceMock extends AbstractServiceMock<ProjectActivityServiceData> {
  handlers = [
    http.get('/api/project_analyses/search', () => {
      return this.ok(this.data.analyses);
    }),

    http.get('/api/measures/search_history', ({ request }) => {
      const metrics = this.getQueryParams(request).get('metrics')?.split(',') ?? [];

      return this.ok({
        measures: metrics.map((metric) => ({
          metric,
          history:
            this.data.measuresHistory.measures.find((m) => m.metric === metric)?.history ?? [],
        })),
        paging: this.data.measuresHistory.paging,
      });
    }),
  ];
}

export const ProjectActivityServiceDefaultDataset: ProjectActivityServiceData = {
  analyses: {
    paging: { pageIndex: 1, pageSize: 500, total: 3 },
    analyses: [
      {
        key: 'analysis-3',
        date: '2024-07-18T09:12:20+0200',
        projectVersion: '2.0',
        manualNewCodePeriodBaseline: false,
        events: [{ key: 'event-3', category: 'VERSION', name: '2.0' }],
      },
      {
        key: 'analysis-2',
        date: '2024-06-15T03:10:03+0200',
        projectVersion: '1.0',
        manualNewCodePeriodBaseline: false,
        events: [{ key: 'event-2', category: 'VERSION', name: '1.0' }],
      },
      {
        key: 'analysis-1',
        date: '2024-05-31T12:46:18+0200',
        projectVersion: 'not provided',
        manualNewCodePeriodBaseline: false,
        events: [],
      },
    ],
  },
  measuresHistory: {
    paging: { pageIndex: 1, pageSize: 1000, total: 3 },
    measures: [
      {
        metric: MetricKey.alert_status,
        history: [
          { date: '2024-05-31T12:46:18+0200', value: 'OK' },
          { date: '2024-06-15T03:10:03+0200', value: 'ERROR' },
          { date: '2024-07-18T09:12:20+0200', value: 'OK' },
        ],
      },
    ],
  },
};
