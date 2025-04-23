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

import { screen } from '@testing-library/react';
import { Route } from 'react-router-dom';
import { ComponentQualifier } from '~shared/types/component';
import BranchesServiceMock from '~sq-server-shared/api/mocks/BranchesServiceMock';
import { ComponentReportServiceMock } from '~sq-server-shared/api/mocks/ComponentReportServiceMock';
import { mockComponent } from '~sq-server-shared/helpers/mocks/component';
import { renderAppWithComponentContext } from '~sq-server-shared/helpers/testReactTestingUtils';
import { byText } from '~sq-server-shared/sonar-aligned/helpers/testSelector';
import { Feature } from '~sq-server-shared/types/features';
import { UnsubscribeApp } from '../UnsubscribeApp';

const ui = {
  unsubscribedSuccessfullyMessageForProject: byText(
    'component_report.unsubscribe_x_success_no_frequency.report.frequency..qualifier.trk',
  ),
  unsubscribedSuccessfullyMessageForApplication: byText(
    'component_report.unsubscribe_x_success_no_frequency.report.frequency..qualifier.app',
  ),
  unsubscribedSuccessfullyMessageForPortfolio: byText(
    'component_report.unsubscribe_x_success_no_frequency.report.frequency..qualifier.vw',
  ),
};

const reportHandler = new ComponentReportServiceMock();
const branchHandler = new BranchesServiceMock();

beforeEach(() => {
  reportHandler.reset();
  branchHandler.reset();
});

it('unsubscribes project', async () => {
  renderUnsubscribeApp();
  expect(await ui.unsubscribedSuccessfullyMessageForProject.find()).toBeInTheDocument();
  expect(screen.getByText('/dashboard?id=my-project', { exact: true })).toBeInTheDocument();
});

it('unsubscribes project with a branch', async () => {
  renderUnsubscribeApp('&branch=normal-branch');
  expect(await ui.unsubscribedSuccessfullyMessageForProject.find()).toBeInTheDocument();
  expect(
    screen.getByText('/dashboard?id=my-project&branch=normal-branch', { exact: true }),
  ).toBeInTheDocument();
});

it('does not unsubscribe project with a pullrequest', async () => {
  renderUnsubscribeApp('&pullRequest=01');
  expect(
    await screen.findByText('/dashboard?id=my-project&pullRequest=01', { exact: true }),
  ).toBeInTheDocument();
  expect(ui.unsubscribedSuccessfullyMessageForProject.query()).not.toBeInTheDocument();
});

it('unsubscribes application', async () => {
  renderUnsubscribeApp(undefined, mockComponent({ qualifier: ComponentQualifier.Application }));
  expect(await ui.unsubscribedSuccessfullyMessageForApplication.find()).toBeInTheDocument();
  expect(screen.getByText('/dashboard?id=my-project', { exact: true })).toBeInTheDocument();
});

it('unsubscribes portfolio', async () => {
  renderUnsubscribeApp(undefined, mockComponent({ qualifier: ComponentQualifier.Portfolio }));
  expect(await ui.unsubscribedSuccessfullyMessageForPortfolio.find()).toBeInTheDocument();
  expect(screen.getByText('/portfolio?id=my-project', { exact: true })).toBeInTheDocument();
});

function renderUnsubscribeApp(additionalSearch = '', component = mockComponent()) {
  return renderAppWithComponentContext(
    '/unsubscribe?id=my-project' + additionalSearch,
    () => <Route element={<UnsubscribeApp />} path="unsubscribe" />,
    {
      featureList: [Feature.BranchSupport],
    },
    {
      component,
    },
  );
}
