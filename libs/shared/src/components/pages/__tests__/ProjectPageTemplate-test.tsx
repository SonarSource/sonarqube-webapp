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

import { createRef } from 'react';
import { renderWithRouter } from '../../../helpers/test-utils';
import { ProjectPageTemplate } from '../ProjectPageTemplate';

jest.mock('~adapters/components/layout/GlobalFooter', () => ({
  GlobalFooter: () => null,
}));

jest.mock('~adapters/components/layout/ProjectContentHeader', () => ({
  ProjectContentHeader: () => null,
}));

it('applies the page class name to the page grid', () => {
  const pageGridRef = createRef<HTMLDivElement>();

  renderWithRouter(
    <ProjectPageTemplate pageClassName="it__overview" ref={pageGridRef} title="Overview">
      Content
    </ProjectPageTemplate>,
  );

  expect(pageGridRef.current).toHaveClass('it__overview');
});
