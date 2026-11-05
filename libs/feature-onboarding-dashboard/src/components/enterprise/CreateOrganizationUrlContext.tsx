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

import { createContext, useContext } from 'react';
import { Path } from 'react-router';

/**
 * Where an enterprise admin starts creating an organization. Undefined when the user may not, so no
 * button is offered. A context because the panels sit below components shared with the organization
 * dashboard.
 */
export const CreateOrganizationUrlContext = createContext<Partial<Path> | undefined>(undefined);

export function useCreateOrganizationUrl() {
  return useContext(CreateOrganizationUrlContext);
}
