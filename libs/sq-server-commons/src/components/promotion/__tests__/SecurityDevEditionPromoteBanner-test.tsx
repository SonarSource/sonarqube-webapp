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

import userEvent from '@testing-library/user-event';
import { byRole } from '~shared/helpers/testSelector';
import { mockAppState } from '../../../helpers/testMocks';
import { renderComponent } from '../../../helpers/testReactTestingUtils';
import { EditionKey } from '../../../types/editions';
import { SecurityDevEditionPromoteBanner } from '../SecurityDevEditionPromoteBanner';

afterEach(() => {
  window.localStorage.clear();
});

it.each([EditionKey.enterprise, EditionKey.developer, EditionKey.datacenter])(
  'should not render when edition is %s',
  (edition) => {
    renderPromotionBanner(undefined, edition);

    expect(
      byRole('heading', { name: 'promotion.security_dev_edition.title' }).query(),
    ).not.toBeInTheDocument();
  },
);

it('should not render when user dismissed it', () => {
  window.localStorage.setItem('security_dev_edition_promotion', 'false');
  renderPromotionBanner(undefined, EditionKey.community);

  expect(
    byRole('heading', { name: 'promotion.security_dev_edition.title' }).query(),
  ).not.toBeInTheDocument();
});

it('should render for community edition', () => {
  renderPromotionBanner(undefined, EditionKey.community);

  expect(
    byRole('heading', { name: 'promotion.security_dev_edition.title' }).get(),
  ).toBeInTheDocument();

  expect(
    byRole('link', { name: /promotion.security_dev_edition.action/ }).get(),
  ).toBeInTheDocument();
});

it('can dismiss banner', async () => {
  const user = userEvent.setup();
  renderPromotionBanner(undefined, EditionKey.community);

  expect(
    byRole('heading', { name: 'promotion.security_dev_edition.title' }).get(),
  ).toBeInTheDocument();

  await user.click(byRole('button', { name: 'promoted_section.dismiss' }).get());

  expect(
    byRole('heading', { name: 'promotion.security_dev_edition.title' }).query(),
  ).not.toBeInTheDocument();
});

function renderPromotionBanner(
  overrides: Partial<Parameters<typeof SecurityDevEditionPromoteBanner>[0]> = {},
  edition: EditionKey = EditionKey.community,
) {
  return renderComponent(<SecurityDevEditionPromoteBanner {...overrides} />, '/', {
    appState: mockAppState({ edition }),
  });
}
