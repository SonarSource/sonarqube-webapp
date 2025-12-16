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

import { ComponentQualifier } from '~shared/types/component';
import { getComponentAsHomepage, isSameHomePage } from '../homepage';
import { mockBranch } from '../mocks/branch-like';
import { mockComponent } from '../mocks/component';

describe('getComponentAsHomepage', () => {
  it('should return a portfolio page', () => {
    expect(
      getComponentAsHomepage(
        mockComponent({ key: 'foo', qualifier: ComponentQualifier.Portfolio }),
        undefined,
      ),
    ).toEqual({
      type: 'PORTFOLIO',
      component: 'foo',
    });
  });

  it('should return a portfolio page for a subportfolio too', () => {
    expect(
      getComponentAsHomepage(
        mockComponent({ key: 'foo', qualifier: ComponentQualifier.SubPortfolio }),
        undefined,
      ),
    ).toEqual({
      type: 'PORTFOLIO',
      component: 'foo',
    });
  });

  it('should return an application page', () => {
    expect(
      getComponentAsHomepage(
        mockComponent({ key: 'foo', qualifier: ComponentQualifier.Application }),
        mockBranch({ name: 'develop' }),
      ),
    ).toEqual({ type: 'APPLICATION', component: 'foo', branch: 'develop' });
  });

  it('should return a project page', () => {
    expect(getComponentAsHomepage(mockComponent(), mockBranch({ name: 'feature/foo' }))).toEqual({
      type: 'PROJECT',
      component: 'my-project',
      branch: 'feature/foo',
    });
  });
});

describe('isSameHomePage', () => {
  it('should homepage equality properly', () => {
    expect(
      isSameHomePage(
        {
          type: 'APPLICATION',
          branch: 'test-branch',
          component: 'test-component',
        },
        {
          type: 'APPLICATION',
          branch: 'test-branch',
          component: 'test-component',
        },
      ),
    ).toBe(true);

    expect(
      isSameHomePage(
        {
          type: 'APPLICATION',
          branch: 'test-branch',
          component: 'test-component',
        },
        {
          type: 'ISSUES',
        },
      ),
    ).toBe(false);

    expect(
      isSameHomePage(
        {
          type: 'APPLICATION',
          branch: 'test-branch',
          component: 'test-component',
        },
        {
          type: 'APPLICATION',
          branch: 'test-branch-1',
          component: 'test-component',
        },
      ),
    ).toBe(false);

    expect(
      isSameHomePage(
        {
          type: 'APPLICATION',
          branch: 'test-branch',
          component: 'test-component',
        },
        {
          type: 'APPLICATION',
          branch: 'test-branch',
          component: 'test-component-1',
        },
      ),
    ).toBe(false);
  });
});
