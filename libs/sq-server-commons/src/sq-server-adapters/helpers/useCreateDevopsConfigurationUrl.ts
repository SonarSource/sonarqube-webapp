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
 * Where to send a user who wants to *create* a DevOps platform configuration. On SQ-Server that is
 * the instance-wide DevOps platform integration administration page.
 *
 * Distinct from {@link useBindingSettingsUrl}, which answers "where do I review the binding I
 * already have": the two resolve to the same page here, but diverge on SQ-Cloud, where creating a
 * binding is its own flow.
 *
 * The `| undefined` in the return type exists only to stay signature-compatible with the SQ-Cloud
 * adapter, which resolves to the organization binding page only while the organization is unbound
 * (and to `undefined` while loading, once bound, or outside an organization). This implementation
 * always resolves to one.
 */
export function useCreateDevopsConfigurationUrl(): Partial<Path> | undefined {
  return getGlobalSettingsUrl(ALM_INTEGRATION_CATEGORY);
}
