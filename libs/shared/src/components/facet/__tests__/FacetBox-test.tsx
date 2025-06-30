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

import { TooltipProvider } from '@sonarsource/echoes-react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from '../../../helpers/test-utils';
import { FacetBox, FacetBoxProps } from '../FacetBox';

it('should render an empty disabled facet box', async () => {
  const user = userEvent.setup();

  const onClick = jest.fn();

  renderComponent({ disabled: true, hasEmbeddedFacets: true, onClick });

  expect(screen.queryByRole('group')).not.toBeInTheDocument();

  expect(screen.getByText('Test FacetBox')).toBeInTheDocument();

  expect(screen.getByRole('button', { expanded: false })).toHaveAttribute('aria-disabled', 'true');

  await user.click(screen.getByRole('button'));

  expect(onClick).not.toHaveBeenCalled();
});

it('should render an inner expanded facet box with count', async () => {
  const user = userEvent.setup();

  const onClear = jest.fn();
  const onClick = jest.fn();

  renderComponent({
    children: 'The panel',
    count: 3,
    inner: true,
    onClear,
    onClick,
    open: true,
  });

  expect(screen.getByRole('group')).toBeInTheDocument();

  expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument();

  await user.click(screen.getByRole('button', { expanded: true }));

  expect(onClick).toHaveBeenCalledWith(false);
});

it('should render loading state', () => {
  renderComponent({ loading: true, open: true, children: 'Content' });

  expect(screen.getByRole('group')).toBeInTheDocument();
  expect(screen.getByText('Content')).toBeInTheDocument();
  // Spinner should be present when loading
});

it('should handle clear functionality', async () => {
  const user = userEvent.setup();
  const onClear = jest.fn();

  renderComponent({ count: 5, onClear, open: true, children: 'Content' });

  expect(screen.getByText('5')).toBeInTheDocument();

  const clearButton = screen.getByTestId('clear-Test FacetBox');
  await user.click(clearButton);

  expect(onClear).toHaveBeenCalledTimes(1);
});

it('should not show clear button when count is zero', () => {
  const onClear = jest.fn();

  renderComponent({ count: 0, onClear, open: true, children: 'Content' });

  expect(screen.queryByTestId('clear-Test FacetBox')).not.toBeInTheDocument();
});

it('should not show clear button when no onClear provided', () => {
  renderComponent({ count: 5, open: true, children: 'Content' });

  expect(screen.queryByTestId('clear-Test FacetBox')).not.toBeInTheDocument();
});

it('should render help content', () => {
  renderComponent({ help: <span data-testid="help-icon">?</span>, children: 'Content' });

  expect(screen.getByTestId('help-icon')).toBeInTheDocument();
});

it('should render second line when provided', () => {
  renderComponent({ secondLine: 'Additional info', children: 'Content' });

  expect(screen.getByText('Additional info')).toBeInTheDocument();
});

it('should render with custom aria label', () => {
  renderComponent({ ariaLabel: 'Custom Aria Label', children: 'Content' });

  expect(screen.getByRole('button', { name: 'Custom Aria Label' })).toBeInTheDocument();
});

it('should handle non-expandable state when no onClick provided', () => {
  renderComponent({ children: 'Content' });

  const button = screen.getByRole('button');
  expect(button).toHaveAttribute('aria-disabled', 'true');
  expect(button).toHaveAttribute('aria-expanded', 'false');
  // Content should not be visible since it's not expandable
  expect(screen.queryByText('Content')).not.toBeInTheDocument();
});

it('should render disabled state with helper tooltip', () => {
  renderComponent({
    disabled: true,
    disabledHelper: 'This filter is disabled',
    children: 'Content',
  });

  expect(screen.getByText('Test FacetBox')).toHaveAttribute('aria-disabled', 'true');
  expect(screen.getByText('Test FacetBox')).toHaveAttribute(
    'aria-label',
    'Test FacetBox, This filter is disabled',
  );
});

it('should render collapsed state by default', () => {
  const onClick = jest.fn();

  renderComponent({ onClick, children: 'Content' });

  expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
  expect(screen.queryByRole('group')).not.toBeInTheDocument();
  expect(screen.queryByText('Content')).not.toBeInTheDocument();
});

function renderComponent({ children, ...props }: Partial<FacetBoxProps> = {}) {
  return renderWithContext(
    <TooltipProvider>
      <FacetBox name="Test FacetBox" {...props}>
        {children}
      </FacetBox>
    </TooltipProvider>,
  );
}
