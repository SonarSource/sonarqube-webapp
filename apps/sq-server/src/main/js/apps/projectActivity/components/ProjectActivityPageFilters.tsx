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

import { ButtonGroup, FormFieldWidth, Label, Select } from '@sonarsource/echoes-react';
import * as React from 'react';
import { LabelValueSelectOption } from '~design-system';
import { isPortfolioLike } from '~shared/helpers/component';
import { ComponentQualifier } from '~shared/types/component';
import { translate } from '~sq-server-commons/helpers/l10n';
import {
  ApplicationAnalysisEventCategory,
  ProjectAnalysisEventCategory,
} from '~sq-server-commons/types/project-activity';
import { Component } from '~sq-server-commons/types/types';
import { Query } from '../utils';
import ProjectActivityDateInput from './ProjectActivityDateInput';

interface ProjectActivityPageFiltersProps {
  category?: string;
  from?: Date;
  project: Pick<Component, 'qualifier'>;
  to?: Date;
  updateQuery: (changes: Partial<Query>) => void;
}

export default function ProjectActivityPageFilters(props: ProjectActivityPageFiltersProps) {
  const { category, project, from, to, updateQuery } = props;

  const isApp = project.qualifier === ComponentQualifier.Application;
  const eventTypes = isApp
    ? Object.values(ApplicationAnalysisEventCategory)
    : Object.values(ProjectAnalysisEventCategory);
  const options: LabelValueSelectOption[] = eventTypes.map((category) => ({
    label: translate('event.category', category),
    value: category,
  }));

  const handleCategoryChange = React.useCallback(
    (option: string | null) => {
      updateQuery({ category: option ?? '' });
    },
    [updateQuery],
  );

  return (
    <div className="sw-flex sw-mb-5 sw-items-center sw-gap-8">
      {!isPortfolioLike(project.qualifier) && (
        <ButtonGroup>
          <Label htmlFor="graph-type">{translate('project_activity.filter_events')}</Label>
          <Select
            data={options}
            hasDropdownAutoWidth
            id="events-filter"
            onChange={(value) => {
              handleCategoryChange(value);
            }}
            placeholder={translate('project_activity.filter_events.placeholder')}
            value={options.find((o) => o.value === category)?.value}
            width={FormFieldWidth.Small}
          />
        </ButtonGroup>
      )}
      <ProjectActivityDateInput from={from} onChange={props.updateQuery} to={to} />
    </div>
  );
}
