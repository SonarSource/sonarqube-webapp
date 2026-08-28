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

/**
 * Module mocks shared by the onboarding dashboard integration suites.
 *
 * No query hook is mocked here.
 *
 * Exported as factories rather than plain objects because a `jest.mock` factory body is hoisted
 * above the imports and so cannot close over one — each suite calls these through
 * `jest.requireActual` from inside its own factory instead.
 *
 * This file deliberately imports nothing. A `jest.mock` factory runs the first time the mocked
 * module is required, which can happen while another module is still evaluating; an import here
 * could make that a cycle and hand the factory a half-initialised module.
 */

/**
 * Resolving the bound organization names is product-specific and, on SQ-Cloud, pulls in the DevOps
 * platform binding queries. Those live behind `private/`, so their service mocks cannot be reached
 * from a shared test.
 */
export function currentBindingMock() {
  return {
    useOnboardingCurrentBinding: () => ({
      devopsOrganizationName: 'acme-devops',
      organizationName: 'Acme',
    }),
  };
}

/**
 * Where "create a DevOps platform configuration" leads is product-specific — SQS has a settings
 * page, SQC has no destination yet — which would make the locked statistics call-to-action a link on
 * one product and a plain button on the other. Pinned to a stub so these shared suites assert one
 * shape; what each product resolves is covered by the adapter's own test.
 */
export function createDevopsConfigurationUrlMock() {
  return {
    useCreateDevopsConfigurationUrl: () => ({ pathname: '/create-configuration' }),
  };
}

/**
 * Same binding constraint as above: the auto-import setting is read from, and written to, the bound
 * platform. The binding panel's own suite covers its states against this same shape.
 */
export function autoImportToggleMock() {
  return {
    useAutoImportToggle: () => ({
      autoImportEnabled: false,
      isEnabledOnFirstLoad: false,
      isLoading: false,
      isPending: false,
      repositoryAccessUrl: undefined,
      toggleAutoImport: jest.fn(),
    }),
  };
}
