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

import { useIntl } from 'react-intl';
import { MeasuresByComponents } from '~shared/types/measures';
import { isDiffMetric } from '~sq-server-commons/helpers/measures';
import { ProjectsQuery } from '~sq-server-commons/types/projects';
import { Project } from '../types';
import ProjectCard from './project-card/ProjectCard';

interface Props {
  cardType?: string;
  isFavorite: boolean;
  isFiltered: boolean;
  measures: MeasuresByComponents[];
  projects: Omit<Project, 'measures'>[];
  query: ProjectsQuery;
}

export default function ProjectsList(props: Readonly<Props>) {
  const { cardType, measures, projects } = props;

  const { formatMessage } = useIntl();

  return (
    <ul aria-label={formatMessage({ id: 'list_of_projects' })}>
      {projects.map((project) => {
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
          <li className="sw-pt-4" key={project.key}>
            <ProjectCard project={{ ...project, measures: componentMeasures }} type={cardType} />
          </li>
        );
      })}
    </ul>
  );
}
