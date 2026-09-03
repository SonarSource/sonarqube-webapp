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

import { ComponentProps } from 'react';
import { useCanCreateProjects } from '~adapters/helpers/useCanCreateProjects';
import { useEditPermissionsUrl } from '~adapters/helpers/useEditPermissionsUrl';
import { renderWithRouter } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import { LockedStatisticsCard } from '../LockedStatisticsCard';

const CTA_DESTINATION = { pathname: '/create-configuration', search: '?category=devops' };

jest.mock('~adapters/helpers/useCanCreateProjects', () => ({
  useCanCreateProjects: jest.fn(),
}));

jest.mock('~adapters/helpers/useEditPermissionsUrl', () => ({
  useEditPermissionsUrl: jest.fn(),
}));

beforeEach(() => {
  jest.mocked(useCanCreateProjects).mockReturnValue(true);
  jest.mocked(useEditPermissionsUrl).mockReturnValue({ pathname: '/admin/permissions' });
});

const ui = {
  title: byText('Unlock onboarding statistics'),
  message: byText('Bind your organization to see your statistics'),
  cta: byRole('button', { name: 'Bind organization' }),
  // The same call-to-action once it has somewhere to go.
  ctaLink: byRole('link', { name: 'Bind organization' }),
};

function renderCard(props: Partial<ComponentProps<typeof LockedStatisticsCard>> = {}) {
  return renderWithRouter(cardWith(props));
}

function cardWith(props: Partial<ComponentProps<typeof LockedStatisticsCard>>) {
  return (
    <LockedStatisticsCard
      ctaLabel="Bind organization"
      message="Bind your organization to see your statistics"
      title="Unlock onboarding statistics"
      {...props}
    />
  );
}

it('renders the copy and call-to-action it is given', () => {
  renderCard();

  expect(ui.title.get()).toBeInTheDocument();
  expect(ui.message.get()).toBeInTheDocument();
  expect(ui.cta.get()).toBeInTheDocument();
});

it('renders the other variant copy without any change to its structure', () => {
  renderCard({
    ctaLabel: 'Import repositories',
    message: 'Import your first repositories',
    title: 'Unlock more statistics',
  });

  expect(byText('Unlock more statistics').get()).toBeInTheDocument();
  expect(byRole('button', { name: 'Import repositories' }).get()).toBeInTheDocument();

  // The card is fully driven by props — no copy leaks between variants.
  expect(ui.title.query()).not.toBeInTheDocument();
  expect(ui.cta.query()).not.toBeInTheDocument();
});

it('calls the handler when the call-to-action is clicked', async () => {
  const onCta = jest.fn();
  const { user } = renderCard({ onCta });

  await user.click(ui.cta.get());

  expect(onCta).toHaveBeenCalledTimes(1);
});

it('renders without a handler, leaving the call-to-action inert', async () => {
  const { user } = renderCard();

  // The default no-op handler keeps the button clickable without throwing.
  await expect(user.click(ui.cta.get())).resolves.toBeUndefined();
});

it('turns the call-to-action into a link when it is given a destination', () => {
  renderWithRouter(cardWith({ ctaTo: CTA_DESTINATION }));

  // Products that resolve a destination navigate instead of firing a handler, so the same
  // call-to-action must stop being a plain button.
  expect(ui.ctaLink.get()).toHaveAttribute(
    'href',
    `${CTA_DESTINATION.pathname}${CTA_DESTINATION.search}`,
  );
  expect(ui.cta.query()).not.toBeInTheDocument();
});

it('keeps the call-to-action a button when no destination is given', () => {
  renderCard();

  // Products with no destination yet — the adapter answers `undefined` — keep the inert button
  // rather than a link that goes nowhere.
  expect(ui.cta.get()).toBeInTheDocument();
  expect(ui.ctaLink.query()).not.toBeInTheDocument();
});

it('shows the permission popover and does not fire the handler when the user lacks permission', async () => {
  jest.mocked(useCanCreateProjects).mockReturnValue(false);
  const onCta = jest.fn();
  const { user } = renderCard({ onCta });

  await user.click(ui.cta.get());

  expect(
    await byText('onboarding_dashboard.journey.permission_required.description').find(),
  ).toBeInTheDocument();
  expect(onCta).not.toHaveBeenCalled();
});
