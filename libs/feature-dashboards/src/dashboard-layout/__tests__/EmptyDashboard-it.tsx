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
import userEvent from '@testing-library/user-event';
import { type ComponentProps } from 'react';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { EmptyDashboard } from '../EmptyDashboard';

const editDescriptionDocUrl =
  'https://docs.sonarsource.com/sonarqube-cloud/managing-your-projects/dashboards/creating-dashboards/';

const nonEditDescriptionDocUrl =
  'https://docs.sonarsource.com/sonarqube-cloud/managing-your-projects/dashboards/';

const baseProps: Omit<
  ComponentProps<typeof EmptyDashboard>,
  'canEdit' | 'isEditing' | 'setIsEditing'
> = {
  editDescriptionDocUrl,
  nonEditDescriptionDocUrl,
};

describe('EmptyDashboard', () => {
  it('should render visual and text elements', () => {
    const setIsEditing = jest.fn();

    renderEmptyDashboard({
      canEdit: true,
      isEditing: false,
      setIsEditing,
      ...baseProps,
    });

    expect(screen.getByTestId('empty-state-graphic-content')).toBeInTheDocument();
    expect(screen.getByText('dashboard.empty.title')).toBeInTheDocument();
    expect(screen.getByText('dashboard.empty.description')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'dashboard.empty.learn_more open_in_new_tab' }),
    ).toBeInTheDocument();
  });

  it('should render button when not editing', () => {
    const setIsEditing = jest.fn();

    renderEmptyDashboard({
      canEdit: true,
      isEditing: false,
      setIsEditing,
      ...baseProps,
    });

    expect(screen.getByRole('button', { name: 'dashboard.add_widgets' })).toBeInTheDocument();
  });

  it('should not render button when editing', () => {
    const setIsEditing = jest.fn();

    renderEmptyDashboard({
      canEdit: true,
      isEditing: true,
      setIsEditing,
      ...baseProps,
    });

    expect(screen.queryByRole('button', { name: 'dashboard.add_widgets' })).not.toBeInTheDocument();
  });

  it('should call setIsEditing with true when button is clicked', async () => {
    const user = userEvent.setup();
    const setIsEditing = jest.fn();

    renderEmptyDashboard({
      canEdit: true,
      isEditing: false,
      setIsEditing,
      ...baseProps,
    });

    await user.click(screen.getByRole('button', { name: 'dashboard.add_widgets' }));

    expect(setIsEditing).toHaveBeenCalledTimes(1);
    expect(setIsEditing).toHaveBeenCalledWith(true);
  });

  it('should render description with link to documentation', () => {
    const setIsEditing = jest.fn();

    renderEmptyDashboard({
      canEdit: true,
      isEditing: false,
      setIsEditing,
      ...baseProps,
    });

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener');
    expect(link).toHaveAttribute(
      'href',
      'https://docs.sonarsource.com/sonarqube-cloud/managing-your-projects/dashboards/creating-dashboards/',
    );
  });

  describe('when user is NOT an organization member', () => {
    it('should show non-member title and description', () => {
      const setIsEditing = jest.fn();

      renderEmptyDashboard({
        canEdit: false,
        isEditing: false,
        setIsEditing,
        ...baseProps,
      });

      expect(screen.getByText('dashboard.empty.title_non_member')).toBeInTheDocument();
      expect(screen.queryByText('dashboard.empty.title')).not.toBeInTheDocument();
      expect(screen.getByText('dashboard.empty.description_non_member')).toBeInTheDocument();
      expect(
        screen.getByRole('link', {
          name: 'dashboard.empty.learn_more_non_member open_in_new_tab',
        }),
      ).toBeInTheDocument();
    });

    it('should render description with link to the generic dashboards page', () => {
      const setIsEditing = jest.fn();

      renderEmptyDashboard({
        canEdit: false,
        isEditing: false,
        setIsEditing,
        ...baseProps,
      });

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', nonEditDescriptionDocUrl);
    });

    it('should NOT show the edit button', () => {
      const setIsEditing = jest.fn();

      renderEmptyDashboard({
        canEdit: false,
        isEditing: false,
        setIsEditing,
        ...baseProps,
      });

      expect(
        screen.queryByRole('button', { name: 'dashboard.add_widgets' }),
      ).not.toBeInTheDocument();
    });
  });
});

function renderEmptyDashboard(props: ComponentProps<typeof EmptyDashboard>) {
  return renderWithRouter(<EmptyDashboard {...props} />);
}
