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

import { Button, ButtonVariety, Checkbox, Spinner } from '@sonarsource/echoes-react';
import { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import type { ProjectInfo } from '../api/cost-savings-api';
import { useProjectListQuery } from '../hooks/useCostSavings';
import { formatCurrency } from '../utils/format';

interface Props {
  onProjectsChange: (projects: string[] | undefined) => void;
  selectedProjects: string[] | undefined;
}

function ProjectScopeSelector({ selectedProjects, onProjectsChange }: Props) {
  const { formatMessage } = useIntl();
  const { data, isLoading, isError } = useProjectListQuery();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const projects = data?.projects ?? [];
  const totalProjects = projects.length;

  // Don't render anything if the API isn't available or returned no projects
  if (isError || (!isLoading && totalProjects === 0)) {
    return null;
  }

  const isAllSelected = selectedProjects === undefined || selectedProjects.length === 0;
  const selectedCount = isAllSelected ? totalProjects : selectedProjects.length;

  const selectedTotal = isAllSelected
    ? projects.reduce((sum, p) => sum + p.estimatedSavings, 0)
    : projects
        .filter((p) => selectedProjects?.includes(p.key))
        .reduce((sum, p) => sum + p.estimatedSavings, 0);

  function handleToggle(key: string, checked: boolean) {
    if (isAllSelected) {
      const newSelection = checked
        ? [key]
        : projects.filter((p) => p.key !== key).map((p) => p.key);
      onProjectsChange(newSelection.length === totalProjects ? undefined : newSelection);
    } else {
      const newSelection = checked
        ? [...(selectedProjects ?? []), key]
        : (selectedProjects ?? []).filter((k) => k !== key);
      onProjectsChange(
        newSelection.length === 0 || newSelection.length === totalProjects
          ? undefined
          : newSelection,
      );
    }
  }

  function isProjectSelected(key: string): boolean {
    return isAllSelected || (selectedProjects?.includes(key) ?? false);
  }

  function handleSelectAll() {
    onProjectsChange(undefined);
  }

  function handleSelectNone() {
    onProjectsChange([]);
  }

  return (
    <div className="sw-relative">
      <Button onClick={() => setIsOpen(!isOpen)} variety={ButtonVariety.Default}>
        {formatMessage(
          { id: 'cost_savings.projects.label' },
          { count: selectedCount, total: totalProjects },
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="sw-fixed sw-inset-0"
            onClick={() => setIsOpen(false)}
            style={{ zIndex: 100 }}
          />
          <div
            className="sw-absolute sw-right-0 sw-top-full sw-mt-1 sw-w-[400px] sw-bg-white sw-rounded-lg sw-border sw-border-solid sw-shadow-lg sw-p-4"
            ref={popoverRef}
            style={{ zIndex: 101 }}
          >
            <Spinner isLoading={isLoading}>
              <div className="sw-flex sw-gap-2 sw-mb-3">
                <Button onClick={handleSelectAll} variety={ButtonVariety.DefaultGhost}>
                  {formatMessage({ id: 'cost_savings.projects.select_all' })}
                </Button>
                <Button onClick={handleSelectNone} variety={ButtonVariety.DefaultGhost}>
                  {formatMessage({ id: 'cost_savings.projects.select_none' })}
                </Button>
              </div>

              <div className="sw-flex sw-flex-col sw-gap-1 sw-max-h-[300px] sw-overflow-y-auto">
                {projects.map((project) => (
                  <ProjectRow
                    isSelected={isProjectSelected(project.key)}
                    key={project.key}
                    onToggle={handleToggle}
                    project={project}
                  />
                ))}
              </div>

              <div className="sw-border-t sw-mt-3 sw-pt-3 sw-text-sm">
                {formatMessage(
                  { id: 'cost_savings.projects.selected_total' },
                  {
                    count: selectedCount,
                    total: formatCurrency(selectedTotal),
                  },
                )}
              </div>
            </Spinner>
          </div>
        </>
      )}
    </div>
  );
}

interface ProjectRowProps {
  isSelected: boolean;
  onToggle: (key: string, checked: boolean) => void;
  project: ProjectInfo;
}

function ProjectRow({ project, isSelected, onToggle }: ProjectRowProps) {
  return (
    <label className="sw-flex sw-items-center sw-gap-2 sw-py-1.5 sw-px-2 sw-rounded sw-cursor-pointer hover:sw-bg-gray-50">
      <Checkbox checked={isSelected} onCheck={(checked) => onToggle(project.key, checked)} />
      <span className="sw-flex-1 sw-text-sm sw-truncate">{project.name}</span>
      <span className="sw-text-xs sw-whitespace-nowrap">
        {project.issueCount.toLocaleString()} issues
      </span>
      <span className="sw-text-sm sw-font-semibold sw-whitespace-nowrap">
        {formatCurrency(project.estimatedSavings)}
      </span>
    </label>
  );
}

export { ProjectScopeSelector };
