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

import { Path } from 'react-router-dom';
import { ALM_INTEGRATION_CATEGORY } from '../../constants/settings';
import { getGlobalSettingsUrl } from '../../helpers/urls';

/**
 * Where to send a user who wants to review the DevOps platform binding. SQ-Server has no
 * organizations, so bindings are configured instance-wide from the global settings; the SQ-Cloud
 * adapter points at the current organization's binding settings instead.
 *
 * Returns `undefined` when the destination cannot be resolved, in which case callers should not
 * render the link at all.
 */
export function useBindingSettingsUrl(): Partial<Path> | undefined {
  return getGlobalSettingsUrl(ALM_INTEGRATION_CATEGORY);
}
