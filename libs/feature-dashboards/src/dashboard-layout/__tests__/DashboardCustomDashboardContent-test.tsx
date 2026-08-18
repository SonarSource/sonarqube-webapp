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

import { screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { render } from '~shared/helpers/test-utils';
import { DashboardCustomDashboardContent } from '../DashboardCustomDashboardContent';
import { createEmptyDashboard } from '../logic/constants';
import type { DashboardInstance } from '../logic/types';

jest.mock('../Dashboard', () => ({
  Dashboard: (props: { isEditing: boolean; width: number }) => (
    <div data-editing={String(props.isEditing)} data-testid="dashboard" data-width={props.width} />
  ),
}));

jest.mock('../EmptyDashboard', () => ({
  EmptyDashboard: (props: {
    editDescriptionDocUrl: string;
    editModeButtonLabelKey: string;
    nonEditDescriptionDocUrl: string;
    setIsEditing: (value: boolean) => void;
  }) => (
    <button
      data-edit-documentation-url={props.editDescriptionDocUrl}
      data-view-documentation-url={props.nonEditDescriptionDocUrl}
      onClick={() => {
        props.setIsEditing(true);
      }}
      type="button"
    >
      {props.editModeButtonLabelKey}
    </button>
  ),
}));

type Props = ComponentProps<typeof DashboardCustomDashboardContent>;

const dashboard = createEmptyDashboard('custom').layout as DashboardInstance<Record<string, {}>>;

function renderContent(overrides: Partial<Props> = {}) {
  const props: Props = {
    bodyMap: {},
    canEdit: true,
    dashboard,
    editBehaviorMap: {},
    emptyDashboardButtonLabelKey: 'enter-edit-mode',
    emptyDashboardEditDocumentationUrl: 'https://docs.example.com/editing',
    emptyDashboardViewDocumentationUrl: 'https://docs.example.com/viewing',
    headerMap: {},
    isEditing: false,
    isEmptyDashboard: () => true,
    onAddWidgetToSection: jest.fn(),
    onDashboardChange: jest.fn(),
    onWidgetEdit: jest.fn(),
    setIsEditing: jest.fn(),
    ...overrides,
  } as Props;

  return render(<DashboardCustomDashboardContent {...props} />);
}

describe('DashboardCustomDashboardContent', () => {
  it('shows the empty dashboard action when an empty dashboard is not being edited', () => {
    renderContent();

    expect(screen.getByRole('button', { name: 'enter-edit-mode' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'enter-edit-mode' })).toHaveAttribute(
      'data-edit-documentation-url',
      'https://docs.example.com/editing',
    );
    expect(screen.getByRole('button', { name: 'enter-edit-mode' })).toHaveAttribute(
      'data-view-documentation-url',
      'https://docs.example.com/viewing',
    );
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
  });

  it('renders the dashboard while editing an empty dashboard', () => {
    renderContent({ isEditing: true });

    expect(screen.getByTestId('dashboard')).toHaveAttribute('data-editing', 'true');
    expect(screen.getByTestId('dashboard')).toHaveAttribute('data-width', '12');
  });

  it('renders the dashboard when it contains widgets', () => {
    renderContent({ isEmptyDashboard: () => false });

    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });
});
