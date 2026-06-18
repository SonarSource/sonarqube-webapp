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
import { mockAppState } from '../../../helpers/testMocks';
import { renderComponent } from '../../../helpers/testReactTestingUtils';
import { EditionKey } from '../../../types/editions';
import { CommunityBuildSecurityNotice } from '../CommunityBuildSecurityNotice';

it.each([EditionKey.enterprise, EditionKey.developer, EditionKey.datacenter])(
  'should not render when edition is %s',
  (edition) => {
    renderNotice(edition);

    expect(byText('promotion.community_build_security.text').query()).not.toBeInTheDocument();
  },
);

it('should render for community build with a link opening in a new tab', () => {
  renderNotice(EditionKey.community);

  expect(byText('promotion.community_build_security.text').get()).toBeInTheDocument();

  const link = byRole('link', { name: /promotion.community_build_security.action/ }).get();
  expect(link).toBeInTheDocument();
  expect(link).toHaveAttribute(
    'href',
    'https://www.sonarsource.com/products/sonarqube/why-upgrade/',
  );
  expect(link).toHaveAttribute('target', '_blank');
});

function renderNotice(edition: EditionKey = EditionKey.community) {
  return renderComponent(<CommunityBuildSecurityNotice />, '/', {
    appState: mockAppState({ edition }),
  });
}
