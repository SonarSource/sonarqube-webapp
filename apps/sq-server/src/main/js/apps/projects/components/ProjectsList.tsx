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

import { AutoSizer } from 'react-virtualized/dist/commonjs/AutoSizer';
import { List, ListRowProps } from 'react-virtualized/dist/commonjs/List';
import { WindowScroller } from 'react-virtualized/dist/commonjs/WindowScroller';
import { MeasuresByComponents } from '~shared/types/measures';
import { translate } from '~sq-server-commons/helpers/l10n';
import { isDiffMetric } from '~sq-server-commons/helpers/measures';
import { ProjectsQuery } from '~sq-server-commons/types/projects';
import { Project } from '../types';
import ProjectCard from './project-card/ProjectCard';

const PROJECT_CARD_HEIGHT = 181;
const PROJECT_CARD_MARGIN = 20;

interface Props {
  cardType?: string;
  isFavorite: boolean;
  isFiltered: boolean;
  measures: MeasuresByComponents[];
  projects: Omit<Project, 'measures'>[];
  query: ProjectsQuery;
  scrollElement?: HTMLDivElement;
}

export default function ProjectsList(props: Readonly<Props>) {
  const { cardType, measures, projects, scrollElement } = props;

  const renderRow = ({ index, key, style }: ListRowProps) => {
    const project = projects[index];
    const componentMeasures =
      measures
        ?.filter((measure) => measure.component === project.key)
        .reduce(
          (acc, measure) => {
            const value = isDiffMetric(measure.metric) ? measure.period?.value : measure.value;
            if (value !== undefined) {
              acc[measure.metric] = value;
            }
            return acc;
          },
          {} as Record<string, string>,
        ) ?? {};

    return (
      <div
        className="sw-pt-4"
        key={key}
        role="row"
        style={{ ...style, height: PROJECT_CARD_HEIGHT }}
      >
        <div className="sw-h-full" role="gridcell">
          <ProjectCard
            key={project.key}
            project={{ ...project, measures: componentMeasures }}
            type={cardType}
          />
        </div>
      </div>
    );
  };

  return (
    <WindowScroller scrollElement={scrollElement}>
      {({ height, isScrolling, onChildScroll, scrollTop }) => (
        <AutoSizer disableHeight>
          {({ width }) => (
            <List
              aria-label={translate('project_plural')}
              autoHeight
              height={height}
              isScrolling={isScrolling}
              onScroll={onChildScroll}
              overscanRowCount={2}
              rowCount={projects.length}
              rowHeight={PROJECT_CARD_HEIGHT + PROJECT_CARD_MARGIN}
              rowRenderer={renderRow}
              scrollTop={scrollTop}
              style={{ outline: 'none' }}
              tabIndex={-1}
              width={width}
            />
          )}
        </AutoSizer>
      )}
    </WindowScroller>
  );
}
