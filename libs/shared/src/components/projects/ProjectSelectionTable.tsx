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

import {
  Badge,
  BadgeVariety,
  cssVar,
  IconProject,
  Table,
  TableVariety,
} from '@sonarsource/echoes-react';
import { Visibility } from '../../types/component';

interface Props {
  ariaLabel: string;
  projectColumnLabel: string;
  keyColumnLabel: string;
  tagsColumnLabel: string;
  visibilityLabel: (visibility: Visibility) => string;
  projects: { id: string; name: string; key: string; tags: string[]; visibility: Visibility }[];
  selectAllLabel: string;
  selectProjectLabel: (name: string) => string;
  value: string[];
  onChange: (value: string[]) => void;
}

/** The caller owns fetching, pagination, and selection across all pages. */
export function ProjectSelectionTable({
  ariaLabel,
  projectColumnLabel,
  keyColumnLabel,
  tagsColumnLabel,
  visibilityLabel,
  projects,
  selectAllLabel,
  selectProjectLabel,
  value,
  onChange,
}: Readonly<Props>) {
  const selectedIds = new Set(value);
  const selectedCount = projects.filter((project) => selectedIds.has(project.id)).length;
  const isAllSelected = selectedCount > 0 && selectedCount === projects.length;
  const isPartiallySelected = selectedCount > 0 && !isAllSelected;

  function changeSelection(ids: string[], checked: boolean) {
    const next = new Set(value);
    for (const id of ids) {
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
    }
    onChange([...next]);
  }

  return (
    <Table
      ariaLabel={ariaLabel}
      gridTemplate="48px repeat(3, minmax(200px, 1fr))"
      style={{ borderColor: cssVar('color-border-weak') }}
      variety={TableVariety.Surface}
    >
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCellCheckbox
            ariaLabel={selectAllLabel}
            checked={isPartiallySelected ? 'indeterminate' : isAllSelected}
            isDisabled={projects.length === 0}
            onCheck={(checked) => {
              changeSelection(
                projects.map((project) => project.id),
                checked === true,
              );
            }}
          />
          <Table.ColumnHeaderCell label={projectColumnLabel} />
          <Table.ColumnHeaderCell label={keyColumnLabel} />
          <Table.ColumnHeaderCell label={tagsColumnLabel} />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {projects.map((project) => (
          <Table.Row key={project.id} selected={selectedIds.has(project.id)}>
            <Table.CellCheckbox
              ariaLabel={selectProjectLabel(project.name)}
              checked={selectedIds.has(project.id)}
              onCheck={(checked) => {
                changeSelection([project.id], checked === true);
              }}
            />
            <Table.RowHeaderCell
              content={
                <span className="sw:inline-flex sw:flex-wrap sw:items-center sw:gap-2">
                  {project.name}
                  <Badge variety={BadgeVariety.Neutral}>
                    {visibilityLabel(project.visibility)}
                  </Badge>
                </span>
              }
              icon={<IconProject />}
            />
            <Table.CellText content={project.key} />
            <Table.CellText
              content={
                project.tags.length > 0 ? (
                  <span className="sw:inline-flex sw:flex-wrap sw:gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variety={BadgeVariety.Neutral}>
                        {tag}
                      </Badge>
                    ))}
                  </span>
                ) : (
                  '—'
                )
              }
            />
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
