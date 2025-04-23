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

import { ComponentQualifier } from '~shared/types/component';
import { mockMainBranch, mockPullRequest } from '~sq-server-shared/helpers/mocks/branch-like';
import {
  getCodeMetrics,
  mostCommonPrefix,
  PortfolioMetrics,
  type GetCodeMetricsOptions,
} from '../utils';

describe('getCodeMetrics', () => {
  it.each`
    includeContainsAiCode | includeQGStatus | portfolioMetrics
    ${false}              | ${false}        | ${PortfolioMetrics.AllCodeAicaAgnostic}
    ${false}              | ${false}        | ${PortfolioMetrics.AllCodeAicaDisabled}
    ${false}              | ${false}        | ${PortfolioMetrics.AllCodeAicaEnabled}
    ${false}              | ${false}        | ${PortfolioMetrics.NewCodeAicaAgnostic}
    ${false}              | ${false}        | ${PortfolioMetrics.NewCodeAicaDisabled}
    ${false}              | ${false}        | ${PortfolioMetrics.NewCodeAicaEnabled}
    ${false}              | ${false}        | ${PortfolioMetrics.Unspecified}
    ${true}               | ${false}        | ${PortfolioMetrics.AllCodeAicaAgnostic}
    ${true}               | ${false}        | ${PortfolioMetrics.AllCodeAicaDisabled}
    ${true}               | ${false}        | ${PortfolioMetrics.AllCodeAicaEnabled}
    ${true}               | ${false}        | ${PortfolioMetrics.NewCodeAicaAgnostic}
    ${true}               | ${false}        | ${PortfolioMetrics.NewCodeAicaDisabled}
    ${true}               | ${false}        | ${PortfolioMetrics.NewCodeAicaEnabled}
    ${true}               | ${false}        | ${PortfolioMetrics.Unspecified}
    ${false}              | ${true}         | ${PortfolioMetrics.AllCodeAicaAgnostic}
    ${false}              | ${true}         | ${PortfolioMetrics.AllCodeAicaDisabled}
    ${false}              | ${true}         | ${PortfolioMetrics.AllCodeAicaEnabled}
    ${false}              | ${true}         | ${PortfolioMetrics.NewCodeAicaAgnostic}
    ${false}              | ${true}         | ${PortfolioMetrics.NewCodeAicaDisabled}
    ${false}              | ${true}         | ${PortfolioMetrics.NewCodeAicaEnabled}
    ${false}              | ${true}         | ${PortfolioMetrics.Unspecified}
    ${true}               | ${true}         | ${PortfolioMetrics.AllCodeAicaAgnostic}
    ${true}               | ${true}         | ${PortfolioMetrics.AllCodeAicaDisabled}
    ${true}               | ${true}         | ${PortfolioMetrics.AllCodeAicaEnabled}
    ${true}               | ${true}         | ${PortfolioMetrics.NewCodeAicaAgnostic}
    ${true}               | ${true}         | ${PortfolioMetrics.NewCodeAicaDisabled}
    ${true}               | ${true}         | ${PortfolioMetrics.NewCodeAicaEnabled}
    ${true}               | ${true}         | ${PortfolioMetrics.Unspecified}
  `(
    'should return the right metrics for portfolios with options { includeContainsAiCode: $includeContainsAiCode, includeQGStatus: $includeQGStatus, portfolioMetrics: $portfolioMetrics }',
    (options: GetCodeMetricsOptions) => {
      expect(getCodeMetrics(ComponentQualifier.Portfolio, undefined, options)).toMatchSnapshot();
    },
  );

  it('should return the right metrics for apps', () => {
    expect(getCodeMetrics(ComponentQualifier.Application)).toMatchSnapshot();
  });

  it('should return the right metrics for projects', () => {
    expect(getCodeMetrics(ComponentQualifier.Project, mockMainBranch())).toMatchSnapshot();
    expect(getCodeMetrics(ComponentQualifier.Project, mockPullRequest())).toMatchSnapshot();
  });
});

describe('#mostCommonPrefix', () => {
  it('should correctly find the common path prefix', () => {
    expect(mostCommonPrefix(['src/main/ts/tests', 'src/main/java/tests'])).toEqual('src/main/');
    expect(mostCommonPrefix(['src/main/ts/app', 'src/main/ts/app'])).toEqual('src/main/ts/');
    expect(mostCommonPrefix(['src/main/ts', 'lib/main/ts'])).toEqual('');
  });
});
