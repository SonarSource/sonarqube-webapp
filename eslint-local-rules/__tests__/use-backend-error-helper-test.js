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

const { RuleTester } = require('eslint');
const useBackendErrorHelper = require('../use-backend-error-helper');

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

ruleTester.run('use-backend-error-helper', useBackendErrorHelper, {
  valid: [
    {
      code: `
        error.message;
        response.data.message;
        error.response?.status;
        getApiErrorMessage(error);
        getBackendErrorSummary(error.response?.data);
      `,
    },
    {
      code: `
        try {
          doSomething();
        } catch (error) {
          error.response?.data?.status;
        }
      `,
    },
    {
      code: `
        const { message } = user;
        render(message);
      `,
    },
    {
      code: `
        const { message } = error.response.data.details;
        render(message);
      `,
    },
    {
      code: `
        const message = error.request.data.message;
        render(message);
      `,
    },
    {
      code: `
        const message = (getError()).response.data.message;
        render(message);
      `,
    },
    {
      code: `
        const message = unknown.response.data.message;
        render(message);
      `,
    },
    {
      code: `
        try {
          doSomething();
        } catch {
          const message = failure.response.data.message;
          render(message);
        }
      `,
    },
    {
      code: `
        const { [getField()]: value } = error.response.data;
        render(value);
      `,
    },
    {
      code: `const { [message]: extracted } = error.response.data;`,
    },
    {
      code: `
        for (const { message } of values) {
          render(message);
        }
      `,
    },
    {
      code: `
        let message;
        message = error.message;
      `,
    },
    {
      code: `
        let target;
        ({ message: target } = user);
      `,
    },
    {
      code: `
        const data = unknown;
        render(data.message);
      `,
    },
    {
      code: `
        useMutation({
          onError: () => {
            const message = failure.response.data.message;
          },
        });
      `,
    },
    {
      code: `useMutation({ onError: getHandler() });`,
    },
    {
      code: `
        function useCreate(request, onError) {
          const directMessage = request.response.data.message;
          const backendError = request.response.data;
          const aliasMessage = backendError.message;
          return useMutation({ onError });
        }
      `,
    },
    {
      code: `
        function handle() {
          const message = failure.response.data.message;
        }
      `,
    },
    {
      code: `
        const handle = (failure) => failure.response.data.message;
        const callback = function (failure) {
          return failure.response.data.message;
        };
      `,
    },
    {
      code: `
        function handle(failure) {
          return failure.response.data.message;
        }
        useMutation({ onError: (failure) => getApiErrorMessage(failure) });
        function handleAnotherFailure(failure) {
          return failure.response.data.message;
        }
      `,
    },
  ],
  invalid: [
    {
      code: `const message = error.response?.data?.message;`,
      errors: [{ messageId: 'useBackendErrorHelper' }],
    },
    {
      code: `const message = (error.response.data as { message: string }).message;`,
      errors: [{ messageId: 'useBackendErrorHelper' }],
    },
    {
      code: `const message = error.response.data!.message;`,
      errors: [{ messageId: 'useBackendErrorHelper' }],
    },
    {
      code: `const code = axiosError.response.data.msg;`,
      errors: [{ messageId: 'useBackendErrorHelper' }],
    },
    {
      code: `const { message } = error.response.data;`,
      errors: [{ messageId: 'useBackendErrorHelper' }],
    },
    {
      code: `const { ['message']: message } = error.response.data;`,
      errors: [{ messageId: 'useBackendErrorHelper' }],
    },
    {
      code: `const errors = error.response.data.errors;`,
      errors: [{ messageId: 'useBackendErrorHelper' }],
    },
    {
      code: `const message = error.response.data.errors[0].message;`,
      errors: [{ messageId: 'useBackendErrorHelper' }],
    },
    {
      code: `const message = error.response.data.errors[index].message;`,
      errors: [{ messageId: 'useBackendErrorHelper' }],
    },
    {
      code: `
        useMutation({
          onError: (failure) => {
            const message = failure.response.data.message;
          },
        });
      `,
      errors: [{ messageId: 'useBackendErrorHelper' }],
    },
    {
      code: `
        function handleEnterpriseCreationFailure(failure) {
          const message = failure.response.data.message;
          render(message);
        }
        useMutation({ onError: handleEnterpriseCreationFailure });
      `,
      errors: [{ messageId: 'useBackendErrorHelper' }],
    },
    {
      code: `
        try {
          doSomething();
        } catch (failure) {
          const message = failure.response.data.message;
        }
      `,
      errors: [{ messageId: 'useBackendErrorHelper' }],
    },
    {
      code: `
        let payload;
        ({ message: payload } = error.response.data);
      `,
      errors: [{ messageId: 'useBackendErrorHelper' }],
    },
    {
      code: `
        const backendError = error.response.data;
        let message;
        ({ message } = backendError);
      `,
      errors: [{ messageId: 'useBackendErrorHelper' }],
    },
    {
      code: `
        useMutation({
          onError: function (failure) {
            const message = failure.response.data.message;
          },
        });
      `,
      errors: [{ messageId: 'useBackendErrorHelper' }],
    },
    {
      code: `
        const handleEnterpriseCreationFailure = (failure) => {
          if (failure.response?.data?.message === EnterpriseCreationError.LicenseKeyInvalid) {
            setValidationMessageIds({ licenseKeyValidation: ErrorIds.LicenseKeyInvalid });
          }
        };
        useMutation({ onError: handleEnterpriseCreationFailure });
      `,
      errors: [{ messageId: 'useBackendErrorHelper' }],
    },
    {
      code: `
        try {
          await createEnterprise();
        } catch (error) {
          const backendError = error.response?.data;
          const errorMessage = backendError?.message;
          render(errorMessage);
        }
      `,
      errors: [{ messageId: 'useBackendErrorHelper' }],
    },
    {
      code: `
        const { message } = error.response.data[dynamicField];
      `,
      errors: [{ messageId: 'useBackendErrorHelper' }],
    },
  ],
});
