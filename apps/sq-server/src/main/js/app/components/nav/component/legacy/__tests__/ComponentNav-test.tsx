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
import { get } from '~shared/helpers/storage';
import { byRole, byText } from '~shared/helpers/testSelector';
import { ComponentQualifier } from '~shared/types/component';
import { MetricKey } from '~shared/types/metrics';
import AlmSettingsServiceMock from '~sq-server-commons/api/mocks/AlmSettingsServiceMock';
import BranchesServiceMock from '~sq-server-commons/api/mocks/BranchesServiceMock';
import { MeasuresServiceMock } from '~sq-server-commons/api/mocks/MeasuresServiceMock';
import { ModeServiceMock } from '~sq-server-commons/api/mocks/ModeServiceMock';
import SettingsServiceMock from '~sq-server-commons/api/mocks/SettingsServiceMock';
import { mockComponent } from '~sq-server-commons/helpers/mocks/component';
import { mockMeasure } from '~sq-server-commons/helpers/testMocks';
import { renderApp } from '~sq-server-commons/helpers/testReactTestingUtils';
import { Mode } from '~sq-server-commons/types/mode';
import { ComponentNavProps, LegacyComponentNav } from '../ComponentNav';

jest.mock('~shared/helpers/storage', () => ({
  get: jest.fn(),
  remove: jest.fn(),
  save: jest.fn(),
}));

const branchesHandler = new BranchesServiceMock();
const almHandler = new AlmSettingsServiceMock();
const modeHandler = new ModeServiceMock();
const measuresHandler = new MeasuresServiceMock();
const settingsHandler = new SettingsServiceMock();

beforeEach(() => {
  settingsHandler.reset();
});

afterEach(() => {
  branchesHandler.reset();
  almHandler.reset();
  modeHandler.reset();
  measuresHandler.reset();
});

it('correctly returns focus to the Project Information link when the drawer is closed', async () => {
  const user = userEvent.setup();
  renderComponentNav();
  await user.click(screen.getByRole('link', { name: 'project.info.title' }));
  expect(await screen.findByText('/project/information?id=my-project')).toBeInTheDocument();
});

describe('MQR mode calculation change message', () => {
  it('does not render the message in standard mode', async () => {
    modeHandler.setMode(Mode.Standard);
    renderComponentNav();

    await waitFor(() => {
      expect(screen.queryByText(/overview.missing_project_data/)).not.toBeInTheDocument();
    });
  });

  it.each([
    ['project', ComponentQualifier.Project],
    ['application', ComponentQualifier.Application],
    ['portfolio', ComponentQualifier.Portfolio],
  ])('does not render message when %s is not computed', async (_, qualifier) => {
    const component = mockComponent({
      qualifier,
      breadcrumbs: [{ key: 'foo', name: 'Foo', qualifier }],
    });
    measuresHandler.registerComponentMeasures({
      [component.key]: {},
    });
    renderComponentNav({ component });

    await waitFor(() => {
      expect(
        byRole('alert')
          .byText(new RegExp(`overview.missing_project_data.${qualifier}`))
          .query(),
      ).not.toBeInTheDocument();
    });
  });

  it.each([
    ['project', ComponentQualifier.Project],
    ['application', ComponentQualifier.Application],
    ['portfolio', ComponentQualifier.Portfolio],
  ])('does not render message when %s mqr metrics computed', async (_, qualifier) => {
    const component = mockComponent({
      qualifier,
      breadcrumbs: [{ key: 'foo', name: 'Foo', qualifier }],
    });
    measuresHandler.registerComponentMeasures({
      [component.key]: {
        [MetricKey.security_rating]: mockMeasure({
          metric: MetricKey.security_rating,
          value: '1.0',
        }),
        [MetricKey.software_quality_security_rating]: mockMeasure({
          metric: MetricKey.software_quality_security_rating,
          value: '1.0',
        }),
      },
    });
    renderComponentNav({ component });

    await waitFor(() => {
      expect(
        byRole('alert')
          .byText(new RegExp(`overview.missing_project_data.${qualifier}`))
          .query(),
      ).not.toBeInTheDocument();
    });
  });

  it.each([
    ['project', ComponentQualifier.Project],
    ['application', ComponentQualifier.Application],
    ['portfolio', ComponentQualifier.Portfolio],
  ])(
    'does not render message when %s mqr metrics are not computed but it was already dismissed',
    async (_, qualifier) => {
      const component = mockComponent({
        qualifier,
        breadcrumbs: [{ key: 'foo', name: 'Foo', qualifier }],
      });
      jest.mocked(get).mockImplementation((key) => {
        const keys: Record<string, string> = {
          [`sonarqube.dismissed_calculation_change_alert.component_${component.key}`]: 'true',
        };
        return keys[key];
      });
      measuresHandler.registerComponentMeasures({
        [component.key]: {
          [MetricKey.security_rating]: mockMeasure({
            metric: MetricKey.security_rating,
            value: '1.0',
          }),
        },
      });
      renderComponentNav({ component });

      await waitFor(() => {
        expect(
          byRole('alert')
            .byText(new RegExp(`overview.missing_project_data.${qualifier}`))
            .query(),
        ).not.toBeInTheDocument();
      });
      jest.mocked(get).mockRestore();
    },
  );

  it.each([
    ['project', ComponentQualifier.Project],
    ['application', ComponentQualifier.Application],
    ['portfolio', ComponentQualifier.Portfolio],
  ])('renders message when %s mqr metrics are not computed', async (_, qualifier) => {
    const component = mockComponent({
      qualifier,
      breadcrumbs: [{ key: 'foo', name: 'Foo', qualifier }],
    });
    measuresHandler.registerComponentMeasures({
      [component.key]: {
        [MetricKey.security_rating]: mockMeasure({
          metric: MetricKey.security_rating,
          value: '1.0',
        }),
      },
    });
    renderComponentNav({ component });

    expect(
      await byText(new RegExp(`overview.missing_project_data.${qualifier}`)).find(),
    ).toBeInTheDocument();

    expect(
      byRole('link', { name: /overview.missing_project_data_link/ }).get(),
    ).toBeInTheDocument();
    expect(byRole('button', { name: 'message_callout.dismiss' }).get()).toBeInTheDocument();
  });
});

function renderComponentNav(props: Partial<ComponentNavProps> = {}) {
  const component =
    props.component ??
    mockComponent({
      breadcrumbs: [{ key: 'foo', name: 'Foo', qualifier: ComponentQualifier.Project }],
    });

  measuresHandler.setComponents({ component, ancestors: [], children: [] });

  return renderApp(
    '/',
    <LegacyComponentNav isInProgress={false} isPending={false} {...props} component={component} />,
  );
}
