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

import { Layout } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import A11ySkipTarget from '~shared/components/a11y/A11ySkipTarget';
import { ProjectPageTemplate } from '~shared/components/pages/ProjectPageTemplate';
import { ComponentQualifier } from '~shared/types/component';
import { Metric } from '~shared/types/measures';
import { MeasureHistory, ParsedAnalysis } from '~sq-server-commons/types/project-activity';
import { Component } from '~sq-server-commons/types/types';
import { Query } from '../utils';
import ProjectActivityAnalysesList from './ProjectActivityAnalysesList';
import ProjectActivityGraphs from './ProjectActivityGraphs';
import ProjectActivityPageFilters from './ProjectActivityPageFilters';

interface Props {
  analyses: ParsedAnalysis[];
  analysesLoading: boolean;
  graphLoading: boolean;
  initializing: boolean;
  isStandardMode?: boolean;
  leakPeriodDate?: Date;
  measuresHistory: MeasureHistory[];
  metrics: Metric[];
  onUpdateQuery: (changes: Partial<Query>) => void;
  project: Pick<Component, 'configuration' | 'key' | 'leakPeriodDate' | 'qualifier'>;
  query: Query;
}

export default function ProjectActivityAppRenderer(props: Props) {
  const {
    analyses,
    measuresHistory,
    query,
    leakPeriodDate,
    analysesLoading,
    initializing,
    graphLoading,
    metrics,
    project,
    isStandardMode,
  } = props;
  const intl = useIntl();
  const { configuration, qualifier } = props.project;
  const canAdmin =
    (qualifier === ComponentQualifier.Project || qualifier === ComponentQualifier.Application) &&
    configuration?.showHistory;
  const canDeleteAnalyses = configuration?.showHistory;

  return (
    <ProjectPageTemplate
      asideLeft={
        <ProjectActivityAnalysesList
          analyses={analyses}
          analysesLoading={analysesLoading}
          canAdmin={canAdmin}
          canDeleteAnalyses={canDeleteAnalyses}
          initializing={initializing}
          leakPeriodDate={leakPeriodDate}
          onUpdateQuery={props.onUpdateQuery}
          project={project}
          query={query}
        />
      }
      pageClassName="it__project-activity"
      skipPageContentWrapper
      title={intl.formatMessage({ id: 'project_activity.page' })}
      width="fluid"
    >
      <A11ySkipTarget anchor="activity_main" />
      <Layout.PageContent className="sw-flex sw-flex-col">
        <ProjectActivityPageFilters
          category={query.category}
          from={query.from}
          project={props.project}
          to={query.to}
          updateQuery={props.onUpdateQuery}
        />

        <ProjectActivityGraphs
          analyses={analyses}
          isStandardMode={isStandardMode}
          leakPeriodDate={leakPeriodDate}
          loading={graphLoading}
          measuresHistory={measuresHistory}
          metrics={metrics}
          project={project.key}
          query={query}
          updateQuery={props.onUpdateQuery}
        />
      </Layout.PageContent>
    </ProjectPageTemplate>
  );
}
