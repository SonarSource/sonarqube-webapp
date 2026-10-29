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
import { byRole } from '~shared/helpers/testSelector';
import { renderComponent } from '~sq-server-commons/helpers/testReactTestingUtils';
import { AlmKeys } from '~sq-server-commons/types/alm-settings';
import { FCProps } from '~sq-server-commons/types/misc';
import { PersonalAccessTokenFields } from '../PersonalAccessTokenFields';

const ui = {
  token: byRole('textbox', { name: /onboarding.create_project.enter_pat/ }),
  email: byRole('textbox', { name: /onboarding.create_project.bitbucket_cloud.enter_username/ }),
  apiToken: byRole('textbox', { name: /onboarding.create_project.bitbucket_cloud.enter_password/ }),
};

it.each([AlmKeys.Azure, AlmKeys.BitbucketServer, AlmKeys.GitLab])(
  'should only ask for a token for %s',
  (almKey) => {
    renderFields({ almKey });

    expect(ui.token.get()).toBeInTheDocument();
    expect(ui.email.query()).not.toBeInTheDocument();
    expect(ui.apiToken.query()).not.toBeInTheDocument();
  },
);

it.each([AlmKeys.Azure, AlmKeys.BitbucketServer])(
  'should render the token field for %s with and without the instance URL',
  (almKey) => {
    const { unmount } = renderFields({ almKey, almSetting: { key: 'conf', url: 'https://host/' } });
    expect(ui.token.get()).toBeInTheDocument();
    unmount();

    renderFields({ almKey, almSetting: { key: 'conf' } });
    expect(ui.token.get()).toBeInTheDocument();
  },
);

it.each([AlmKeys.Azure, AlmKeys.BitbucketServer, AlmKeys.GitLab])(
  'should mark the token field as invalid for %s',
  (almKey) => {
    renderFields({ almKey, isInvalid: true });

    expect(ui.token.get()).toBeInvalid();
  },
);

it('should ask for the email and the API token for Bitbucket Cloud', async () => {
  const user = userEvent.setup();
  const onPasswordChange = jest.fn();
  const onUsernameChange = jest.fn();
  renderFields({ almKey: AlmKeys.BitbucketCloud, onPasswordChange, onUsernameChange });

  expect(ui.token.query()).not.toBeInTheDocument();

  await user.type(ui.email.get(), 'a');
  expect(onUsernameChange).toHaveBeenCalled();
  expect(onPasswordChange).not.toHaveBeenCalled();

  await user.type(ui.apiToken.get(), 'b');
  expect(onPasswordChange).toHaveBeenCalled();
});

it('should show the entered values and mark the fields as invalid', () => {
  renderFields({
    almKey: AlmKeys.BitbucketCloud,
    isInvalid: true,
    onUsernameChange: jest.fn(),
    password: 'my-api-token',
    username: 'me@example.com',
  });

  expect(ui.email.get()).toHaveValue('me@example.com');
  expect(ui.apiToken.get()).toHaveValue('my-api-token');
  expect(ui.email.get()).toBeInvalid();
  expect(ui.apiToken.get()).toBeInvalid();
});

it('should not render any field for GitHub', () => {
  renderFields({ almKey: AlmKeys.GitHub });

  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});

function renderFields(overrides: Partial<FCProps<typeof PersonalAccessTokenFields>> = {}) {
  return renderComponent(
    <PersonalAccessTokenFields
      almKey={AlmKeys.GitLab}
      almSetting={{ key: 'conf' }}
      isInvalid={false}
      onPasswordChange={jest.fn()}
      password=""
      {...overrides}
    />,
  );
}
