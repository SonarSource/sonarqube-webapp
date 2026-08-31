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

import { useCallback } from 'react';
import { ComponentRaw } from '../../api/components';
import { useAllProjectsQuery } from '../../queries/projects';

/**
 * Resolves project UUIDs to their project keys.
 *
 * There is no bulk uuid->key endpoint on Server, so this fetches every project on the instance
 * (see `useAllProjectsQuery`) and narrows the result down to the requested uuids.
 * `organizationKey` is part of the shared adapter signature — SonarCloud needs it to scope its
 * query — but is unused here since Server has no organization concept.
 *
 * TODO SONARCH-3162: this whole adapter becomes unnecessary once the architecture graph API
 * exposes `projectKey` directly on each project component.
 */
export function useProjectKeysByUuid(projectUuids: string[], _organizationKey: string) {
  // Builds a Map, and query-core can't structurally compare Maps — an inline arrow here
  // would produce a new one every render regardless of whether the projects actually
  // changed, forcing every downstream memo to redo its work for nothing.
  const select = useCallback(
    (projects: Array<ComponentRaw & { uuid: string }>) => {
      const wantedUuids = new Set(projectUuids);
      return new Map(
        projects
          .filter((project) => wantedUuids.has(project.uuid))
          .map((project) => [project.uuid, project.key]),
      );
    },
    [projectUuids],
  );

  return useAllProjectsQuery({
    enabled: projectUuids.length > 0,
    select,
  });
}
