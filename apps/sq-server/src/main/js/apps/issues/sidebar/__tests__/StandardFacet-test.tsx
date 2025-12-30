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

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { STANDARDS_REGISTRY } from '~shared/helpers/compliance-standards-registry';
import { mockQuery } from '~sq-server-commons/helpers/mocks/issues';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { StandardFacet } from '../StandardFacet';

jest.mock('~shared/helpers/security-standards', () => ({
  getStandards: jest.fn(() =>
    Promise.resolve({
      'owaspMobileTop10-2024': {
        m1: 'M1 - Improper Credential Usage',
        m2: 'M2 - Inadequate Supply Chain Security',
      },
      'owaspTop10-2021': {
        a1: 'A1 - Broken Access Control',
        a2: 'A2 - Cryptographic Failures',
      },
      'owaspTop10-2025': {
        a1: 'A1 - Broken access control',
        a7: 'A7 - Authentication failures',
      },
      owaspTop10: {
        a1: 'A1 - Injection',
        a2: 'A2 - Broken Authentication',
      },
      'owaspLlmTop10-2025': {
        llm1: 'LLM1 - Prompt Injection',
        llm2: 'LLM2 - Sensitive Information Disclosure',
      },
      cwe: {
        79: 'CWE-79 - Cross-site Scripting (XSS)',
        89: 'CWE-89 - SQL Injection',
      },
      sonarsourceSecurity: {
        'buffer-overflow': 'Buffer Overflow',
        'sql-injection': 'SQL Injection',
      },
      'pciDss-3.2': {},
      'pciDss-4.0': {},
      'owaspAsvs-4.0': {},
      'owaspAsvs-5.0': {},
      'owaspMasvs-v2': {},
      'stig-ASD_V5R3': {
        'V-222596': 'V-222596 - Application must not be vulnerable to SQL Injection',
        'V-222597': 'V-222597 - Application must not be vulnerable to XSS',
      },
      'stig-ASD_V6': {
        'V-265634': 'V-265634 - Application must not be vulnerable to SQL Injection',
        'V-222597': 'V-222597 - Application must not be vulnerable to XSS',
      },
      casa: {},
    }),
  ),
  renderCWECategory: jest.fn((_standards, cwe) => `CWE-${cwe}`),
  renderOwaspMobileTop102024Category: jest.fn((_standards, item: string) => `M${item}`),
  renderOwaspTop102021Category: jest.fn((_standards, item) => `A${item}`),
  renderOwaspTop102025Category: jest.fn((_standards, item) => `A${item}`),
  renderOwaspTop10Category: jest.fn((_standards, item) => `A${item}`),
  renderOwaspTop10ForLlm2025Category: jest.fn((_standards, item: string) => `LLM${item}`),
  renderSonarSourceSecurityCategory: jest.fn((_standards, item: string) => item),
  renderStigCategory: jest.fn((_standards, item: string) => item),
  renderStigV6Category: jest.fn((_standards, item: string) => item),
}));

afterEach(() => {
  jest.clearAllMocks();
});

it('should toggle owaspMobileTop10-2024 sub-facet', async () => {
  const onToggle = jest.fn();
  const user = userEvent.setup();

  renderStandardFacet({ onToggle, open: true });

  await user.click(
    await screen.findByRole('button', { name: 'issues.facet.owaspMobileTop10_2024' }),
  );
  expect(onToggle).toHaveBeenLastCalledWith('owaspMobileTop10-2024');
});

it('should select owaspMobileTop10-2024 items', async () => {
  const onChange = jest.fn();
  const user = userEvent.setup();

  renderStandardFacet({
    onChange,
    open: true,
    'owaspMobileTop10-2024': [],
    'owaspMobileTop10-2024Open': true,
    'owaspMobileTop10-2024Stats': { m1: 6, m2: 8 },
  });

  await user.click(await screen.findByRole('checkbox', { name: /Mm1/ }));

  expect(onChange).toHaveBeenLastCalledWith({
    'owaspMobileTop10-2024': ['m1'],
  });
});

it('should select multiple owaspMobileTop10-2024 items with ctrl/cmd key', async () => {
  const onChange = jest.fn();
  const user = userEvent.setup();

  renderStandardFacet({
    onChange,
    open: true,
    'owaspMobileTop10-2024': ['m1'],
    'owaspMobileTop10-2024Open': true,
    'owaspMobileTop10-2024Stats': { m1: 6, m2: 8 },
  });

  await user.keyboard('{Control>}');
  await user.click(screen.getByRole('checkbox', { name: /Mm2/ }));

  expect(onChange).toHaveBeenLastCalledWith({
    'owaspMobileTop10-2024': ['m1', 'm2'],
  });
});

it('should clear standards facet including owaspMobileTop10-2024', async () => {
  const onChange = jest.fn();
  const user = userEvent.setup();

  renderStandardFacet({
    onChange,
    'owaspMobileTop10-2024': ['m1'],
    sonarsourceSecurity: ['sql-injection'],
  });

  await user.click(await screen.findByTestId('clear-issues.facet.standards'));

  const expectedClearedStandards = Object.fromEntries(
    STANDARDS_REGISTRY.map((standard) => [standard.queryProp, []]),
  );

  expect(onChange).toHaveBeenCalledWith({
    standards: [],
    ...expectedClearedStandards,
  });
});

it('should show correct count when owaspMobileTop10-2024 values are selected', async () => {
  renderStandardFacet({
    'owaspMobileTop10-2024': ['m1', 'm2'],
    sonarsourceSecurity: ['sql-injection'],
  });

  // Wait for the component to finish loading standards and render the count
  await waitFor(() => {
    // The getValues method is called when determining the count badge
    // With 3 selected items (2 mobile + 1 sonar = 3)
    expect(screen.getByRole('img', { name: /x_selected.3/ })).toBeInTheDocument();
  });
});

it('should toggle owaspTop10-2025 sub-facet', async () => {
  const onToggle = jest.fn();
  const user = userEvent.setup();

  renderStandardFacet({ onToggle, open: true });

  await user.click(await screen.findByRole('button', { name: 'issues.facet.owaspTop10_2025' }));
  expect(onToggle).toHaveBeenLastCalledWith('owaspTop10-2025');
});

it('should select owaspTop10-2025 items', async () => {
  const onChange = jest.fn();
  const user = userEvent.setup();

  renderStandardFacet({
    onChange,
    open: true,
    'owaspTop10-2025': [],
    'owaspTop10-2025Open': true,
    'owaspTop10-2025Stats': { a1: 10, a7: 5 },
  });

  await user.click(await screen.findByRole('checkbox', { name: /Aa1/ }));

  expect(onChange).toHaveBeenLastCalledWith({
    'owaspTop10-2025': ['a1'],
  });
});

it('should toggle stig-ASD_V6 sub-facet', async () => {
  const onToggle = jest.fn();
  const user = userEvent.setup();

  renderStandardFacet({ onToggle, open: true });

  await user.click(await screen.findByRole('button', { name: 'issues.facet.stigAsd_v6' }));
  expect(onToggle).toHaveBeenLastCalledWith('stig-ASD_V6');
});

it('should select stig-ASD_V6 items', async () => {
  const onChange = jest.fn();
  const user = userEvent.setup();

  renderStandardFacet({
    onChange,
    open: true,
    'stig-ASD_V6': [],
    'stig-ASD_V6Open': true,
    'stig-ASD_V6Stats': { 'V-265634': 8, 'V-222597': 3 },
  });

  await user.click(await screen.findByRole('checkbox', { name: /V-265634/ }));

  expect(onChange).toHaveBeenLastCalledWith({
    'stig-ASD_V6': ['V-265634'],
  });
});

it('should toggle stig-ASD_V5R3 sub-facet', async () => {
  const onToggle = jest.fn();
  const user = userEvent.setup();

  renderStandardFacet({ onToggle, open: true });

  await user.click(await screen.findByRole('button', { name: 'issues.facet.stigAsd_v5r3' }));
  expect(onToggle).toHaveBeenLastCalledWith('stig-ASD_V5R3');
});

it('should select stig-ASD_V5R3 items', async () => {
  const onChange = jest.fn();
  const user = userEvent.setup();

  renderStandardFacet({
    onChange,
    open: true,
    'stig-ASD_V5R3': [],
    'stig-ASD_V5R3Open': true,
    'stig-ASD_V5R3Stats': { 'V-222596': 12, 'V-222597': 6 },
  });

  await user.click(await screen.findByRole('checkbox', { name: /V-222596/ }));

  expect(onChange).toHaveBeenLastCalledWith({
    'stig-ASD_V5R3': ['V-222596'],
  });
});

interface StandardFacetProps {
  [key: string]: unknown;
  onChange?: jest.Mock;
  onToggle?: jest.Mock;
  open?: boolean;
}

function renderStandardFacet(props: StandardFacetProps = {}) {
  const { onChange = jest.fn(), onToggle = jest.fn(), open = false, ...otherProps } = props;

  // Dynamically generate standards from registry
  const standards = Object.fromEntries(
    STANDARDS_REGISTRY.map((s) => {
      const { queryProp } = s;
      const openProp = `${queryProp}Open`;
      const statsProp = `${queryProp}Stats`;
      return [
        s.key,
        {
          fetching:
            (otherProps[`fetching${s.key.charAt(0).toUpperCase() + s.key.slice(1)}`] as boolean) ??
            false,
          open: (otherProps[openProp] as boolean) ?? false,
          stats: (otherProps[statsProp] as Record<string, number>) ?? {},
          values: (otherProps[queryProp] as string[]) ?? [],
        },
      ];
    }),
  );

  const defaultProps = {
    onChange,
    onToggle,
    open,
    query: mockQuery(),
    standards,
    ...otherProps,
  };

  return renderComponent(<StandardFacet {...defaultProps} />);
}
