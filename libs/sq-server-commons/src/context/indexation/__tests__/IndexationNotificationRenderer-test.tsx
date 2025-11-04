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

import { byRole, byText } from '~shared/helpers/testSelector';
import { getSystemInfo } from '../../../api/system';
import { mockAppState, mockClusterSysInfo } from '../../../helpers/testMocks';
import { renderComponent } from '../../../helpers/testReactTestingUtils';
import { EditionKey } from '../../../types/editions';
import { IndexationNotificationType } from '../../../types/indexation';
import { FCProps } from '../../../types/misc';
import IndexationNotificationRenderer from '../IndexationNotificationRenderer';

jest.mock('../../../api/system', () => ({
  getSystemInfo: jest.fn(),
}));

describe('Indexation notification renderer', () => {
  const ui = {
    inProgressText: byText(/indexation.in_progress\s*indexation.features_partly_available/),
    completedText: byText('indexation.completed'),
    completedWithFailures: byText('indexation.completed_with_error'),
    docLink: byRole('link', {
      name: /indexation.features_partly_available.link/,
    }),
    serveyLink: byRole('link', { name: /indexation.upgrade_survey_link_link/ }),
  };

  it('should display "In progress" status', () => {
    renderIndexationNotificationRenderer({
      type: IndexationNotificationType.InProgress,
    });

    expect(ui.inProgressText.get()).toBeInTheDocument();
    expect(ui.docLink.get()).toBeInTheDocument();
  });

  it('should display "In progress with failures" status', () => {
    renderIndexationNotificationRenderer({
      type: IndexationNotificationType.InProgressWithFailure,
    });

    expect(ui.inProgressText.get()).toBeInTheDocument();
    expect(ui.docLink.get()).toBeInTheDocument();
  });

  it('should display "Completed" status', () => {
    renderIndexationNotificationRenderer({
      type: IndexationNotificationType.Completed,
    });

    expect(ui.completedText.get()).toBeInTheDocument();
  });

  it('should display "Completed with failures" status', () => {
    renderIndexationNotificationRenderer({
      type: IndexationNotificationType.CompletedWithFailure,
    });

    expect(ui.completedWithFailures.get()).toBeInTheDocument();
  });

  it('should display the serveyLink', async () => {
    jest
      .mocked(getSystemInfo)
      .mockResolvedValueOnce(mockClusterSysInfo({ System: { 'Lines of Code': 74240 } }));

    renderIndexationNotificationRenderer({
      type: IndexationNotificationType.Completed,
      shouldDisplaySurveyLink: true,
    });

    expect(await ui.serveyLink.find()).toBeInTheDocument();
    expect(ui.serveyLink.get()).toHaveAttribute(
      'href',
      'https://a.sprig.com/U1h4UFpySUNwN2ZtfnNpZDowNWUyNmRkZC01MmUyLTQ4OGItOTA3ZC05M2VjYjQxZTYzN2Y=?edition=enterprise&version=7.4&loc=74240',
    );
  });
});

function renderIndexationNotificationRenderer(
  props: Partial<FCProps<typeof IndexationNotificationRenderer>> = {},
) {
  renderComponent(
    <IndexationNotificationRenderer
      completedCount={23}
      onDismissBanner={() => undefined}
      shouldDisplaySurveyLink={false}
      total={42}
      type={IndexationNotificationType.InProgress}
      {...props}
    />,
    '',
    {
      appState: mockAppState({
        version: '7.4',
        edition: EditionKey.enterprise,
      }),
    },
  );
}
