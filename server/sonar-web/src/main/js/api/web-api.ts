///
/// SonarQube
/// Copyright (C) 2009-2018 SonarSource SA
/// mailto:info AT sonarsource DOT com
///
/// This program is free software; you can redistribute it and/or
/// modify it under the terms of the GNU Lesser General Public
/// License as published by the Free Software Foundation; either
/// version 3 of the License, or (at your option) any later version.
///
/// This program is distributed in the hope that it will be useful,
/// but WITHOUT ANY WARRANTY; without even the implied warranty of
/// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
/// Lesser General Public License for more details.
///
/// You should have received a copy of the GNU Lesser General Public License
/// along with this program; if not, write to the Free Software Foundation,
/// Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
///

/*
 * SonarQube
 * Copyright (C) 2009-2017 SonarSource SA
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
import { getJSON } from '../helpers/request';

export interface Changelog {
  description: string;
  version: string;
}

export interface Param {
  key: string;
  defaultValue?: string;
  description: string;
  deprecatedKey?: string;
  deprecatedKeySince?: string;
  deprecatedSince?: string;
  exampleValue?: string;
  internal: boolean;
  maxValuesAllowed?: number;
  possibleValues?: string[];
  required: boolean;
  since?: string;
}

export interface Action {
  key: string;
  changelog: Changelog[];
  description: string;
  deprecatedSince?: string;
  hasResponseExample: boolean;
  internal: boolean;
  params?: Param[];
  post: boolean;
  since?: string;
}

export interface Domain {
  actions: Action[];
  description: string;
  deprecated: boolean;
  internal: boolean;
  path: string;
  since?: string;
}

export interface Example {
  example: string;
  format: string;
}

export function fetchWebApi(showInternal: boolean = true): Promise<Array<Domain>> {
  return getJSON('/api/webservices/list', { include_internals: showInternal }).then(r =>
    r.webServices.map((domain: any) => {
      const deprecated = !domain.actions.find((action: any) => !action.deprecatedSince);
      const internal = !domain.actions.find((action: any) => !action.internal);
      return { ...domain, deprecated, internal };
    })
  );
}

export function fetchResponseExample(domain: string, action: string): Promise<Example> {
  return getJSON('/api/webservices/response_example', { controller: domain, action });
}
