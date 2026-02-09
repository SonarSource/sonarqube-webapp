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
import { renderComponent } from '../../../helpers/testReactTestingUtils';
import { DefaultExtensionPageTemplate } from '../DefaultExtensionPageTemplate';

it('should render children with default props', () => {
  renderDefaultExtensionPageTemplate();

  expect(screen.getByText('Extension content')).toBeInTheDocument();
  expect(screen.getByTestId('mocked-global-footer')).toBeInTheDocument();
});

it('should render with title', () => {
  renderDefaultExtensionPageTemplate({ title: 'My Extension' });

  expect(screen.getByText('Extension content')).toBeInTheDocument();
});

it('should render with contentHeader', () => {
  renderDefaultExtensionPageTemplate({
    contentHeader: <div data-testid="content-header">Content Header</div>,
  });

  expect(screen.getByTestId('content-header')).toBeInTheDocument();
  expect(screen.getByText('Content Header')).toBeInTheDocument();
});

it('should render with header', () => {
  renderDefaultExtensionPageTemplate({
    header: <div data-testid="page-header">Page Header</div>,
  });

  expect(screen.getByTestId('page-header')).toBeInTheDocument();
  expect(screen.getByText('Page Header')).toBeInTheDocument();
});

it('should render with asideLeft', () => {
  renderDefaultExtensionPageTemplate({
    asideLeft: <div data-testid="aside-left">Sidebar</div>,
  });

  expect(screen.getByTestId('aside-left')).toBeInTheDocument();
  expect(screen.getByText('Sidebar')).toBeInTheDocument();
});

it('should render children in PageContent wrapper by default', () => {
  renderDefaultExtensionPageTemplate();

  // Test behavior: when wrapped in PageContent, content is rendered normally
  expect(screen.getByText('Extension content')).toBeInTheDocument();
});

it('should render children without PageContent wrapper when skipPageContentWrapper is true', () => {
  renderDefaultExtensionPageTemplate({
    skipPageContentWrapper: true,
  });

  // Test behavior: children still render when skipPageContentWrapper is true
  expect(screen.getByText('Extension content')).toBeInTheDocument();
});

it('should render with custom width', () => {
  renderDefaultExtensionPageTemplate({ width: 'fluid' });

  expect(screen.getByText('Extension content')).toBeInTheDocument();
});

it('should render all optional props together', () => {
  renderDefaultExtensionPageTemplate({
    asideLeft: <div data-testid="aside">Aside</div>,
    contentHeader: <div data-testid="content-header">Content Header</div>,
    header: <div data-testid="header">Header</div>,
    skipPageContentWrapper: true,
    title: 'Full Extension',
    width: 'fluid',
  });

  expect(screen.getByTestId('aside')).toBeInTheDocument();
  expect(screen.getByTestId('content-header')).toBeInTheDocument();
  expect(screen.getByTestId('header')).toBeInTheDocument();
  expect(screen.getByText('Extension content')).toBeInTheDocument();
});

function renderDefaultExtensionPageTemplate(
  props: Partial<React.ComponentProps<typeof DefaultExtensionPageTemplate>> = {},
) {
  return renderComponent(
    <DefaultExtensionPageTemplate {...props}>
      <div>Extension content</div>
    </DefaultExtensionPageTemplate>,
  );
}
