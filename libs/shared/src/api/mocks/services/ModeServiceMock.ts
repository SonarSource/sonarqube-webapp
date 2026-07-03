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

import { http } from 'msw';
import { AbstractServiceMock } from '../AbstractServiceMock';

// The mode ("MQR" vs "Standard Experience") endpoint is served under a fixed path on
// SonarQube Server (see libs/sq-server-commons/src/api/mode.ts). It is duplicated here as a
// string literal rather than imported from sq-server-commons to keep this shared mock free of
// app-level dependencies. SonarQube Cloud never calls this endpoint, so the handler is inert there.
const MODE_PATH = '/api/v2/clean-code-policy/mode';

export interface ModeServiceData {
  mode: 'MQR' | 'STANDARD_EXPERIENCE';
  modified: boolean;
}

export class ModeServiceMock extends AbstractServiceMock<ModeServiceData> {
  handlers = [
    http.get(MODE_PATH, () => this.ok(this.data)),

    http.patch(MODE_PATH, async ({ request }) => {
      const body = (await request.json()) as Partial<ModeServiceData>;
      if (body.mode !== undefined) {
        this.data.mode = body.mode;
      }
      this.data.modified = true;
      return this.ok(this.data);
    }),
  ];
}

export const ModeServiceDefaultDataset: ModeServiceData = {
  mode: 'MQR',
  modified: false,
};
