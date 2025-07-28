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

const { RuleTester } = require('eslint');
const rule = require('../no-direct-axios-import');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run('no-direct-axios-import', rule, {
  valid: [
    // Valid: Using axiosClient from shared helpers
    {
      code: "import { axiosClient } from '~shared/helpers/axios-clients';",
    },
    {
      code: "import { axiosToCatch } from '~shared/helpers/axios-clients';",
    },
    {
      code: `
        import { axiosClient } from '~shared/helpers/axios-clients';
        axiosClient.get('/api/data');
      `,
    },
    {
      code: `
        import { axiosToCatch } from '~shared/helpers/axios-clients';
        axiosToCatch.post('/api/data', { data: 'test' });
      `,
    },
    // Valid: In allowed files
    {
      code: "import axios from 'axios';",
      filename: 'axios-clients.ts',
    },
    {
      code: "import axios from 'axios';",
      filename: 'axios-setup-test.ts',
    },
    {
      code: "import axios from 'axios';",
      filename: 'vite.config.ts',
    },
    // Valid: Named imports from axios (if any)
    {
      code: "import { AxiosResponse } from 'axios';",
    },
  ],
  invalid: [
    // Invalid: Direct axios default import
    {
      code: "import axios from 'axios';",
      errors: [
        {
          messageId: 'noDirectAxiosImport',
        },
      ],
      output: "import { axiosClient } from '~shared/helpers/axios-clients';",
    },
    // Invalid: Direct axios usage
    {
      code: `
        import axios from 'axios';
        axios.get('/api/data');
      `,
      errors: [
        {
          messageId: 'noDirectAxiosImport',
        },
        {
          messageId: 'noDirectAxiosUsage',
          data: { method: 'get' },
        },
      ],
      output: `
        import { axiosClient } from '~shared/helpers/axios-clients';
        axiosClient.get('/api/data');
      `,
    },
    // Invalid: Various HTTP methods
    {
      code: 'axios.post("/api/data", data);',
      errors: [
        {
          messageId: 'noDirectAxiosUsage',
          data: { method: 'post' },
        },
      ],
      output: 'axiosClient.post("/api/data", data);',
    },
    {
      code: 'axios.put("/api/data", data);',
      errors: [
        {
          messageId: 'noDirectAxiosUsage',
          data: { method: 'put' },
        },
      ],
      output: 'axiosClient.put("/api/data", data);',
    },
    {
      code: 'axios.delete("/api/data");',
      errors: [
        {
          messageId: 'noDirectAxiosUsage',
          data: { method: 'delete' },
        },
      ],
      output: 'axiosClient.delete("/api/data");',
    },
    {
      code: 'axios.create();',
      errors: [
        {
          messageId: 'noDirectAxiosUsage',
          data: { method: 'create' },
        },
      ],
      output: 'axiosClient.create();',
    },
  ],
});
