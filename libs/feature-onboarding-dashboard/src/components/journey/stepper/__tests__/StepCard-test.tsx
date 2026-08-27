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
import { renderWithContext } from '~shared/helpers/test-utils';
import { byRole, byText } from '~shared/helpers/testSelector';
import { StepCardVisual } from '../../../../types/types';
import { StepCard } from '../StepCard';

const ui = {
  card: byRole('button', { name: 'Step title' }),
  // A locked card names itself as locked: formatMessage joins id + values with dots.
  lockedCard: byRole('button', {
    name: 'onboarding_dashboard.journey.step.locked_aria_label.Step title',
  }),
  secondaryLine: byText('secondary caption'),
  // The donut label is rendered by OnboardingProgressDonut via the react-intl mock as
  // `<id>.<value>`, so the value is embedded in the text (percent.0 when donutPercent is omitted).
  donutLabel: (value: number) => byText(`onboarding_dashboard.percent.${value}`),
};

function renderStepCard(props: Partial<ComponentProps<typeof StepCard>> = {}) {
  return renderWithContext(
    <StepCard
      isSelected={false}
      onSelect={jest.fn()}
      title="Step title"
      visual={StepCardVisual.Donut}
      {...props}
    />,
  );
}

it('renders the donut visual with its percentage label', () => {
  renderStepCard({ visual: StepCardVisual.Donut, donutPercent: 40 });

  expect(ui.card.get()).toBeInTheDocument();
  expect(ui.donutLabel(40).get()).toBeInTheDocument();
});

it('defaults the donut ring to 0 when no percentage is provided', () => {
  renderStepCard({ visual: StepCardVisual.Donut, donutPercent: undefined });

  expect(ui.donutLabel(0).get()).toBeInTheDocument();
});

it.each([
  StepCardVisual.AvatarDone,
  StepCardVisual.AvatarUnbound,
  StepCardVisual.RingLocked,
] as const)('renders the %s visual without a percentage label', (visual) => {
  renderStepCard({ visual });

  expect(ui.card.get()).toBeInTheDocument();
  expect(ui.donutLabel(0).query()).not.toBeInTheDocument();
});

it('renders the secondary line only when provided', () => {
  const { rerender } = renderStepCard({ secondaryLine: 'secondary caption' });
  expect(ui.secondaryLine.get()).toBeInTheDocument();

  rerender(
    <StepCard
      isSelected={false}
      onSelect={jest.fn()}
      title="Step title"
      visual={StepCardVisual.Donut}
    />,
  );
  expect(ui.secondaryLine.query()).not.toBeInTheDocument();
});

it('conveys the selected state through aria-pressed', () => {
  const { rerender } = renderStepCard({ isSelected: true });
  expect(ui.card.get()).toHaveAttribute('aria-pressed', 'true');

  rerender(
    <StepCard
      isSelected={false}
      onSelect={jest.fn()}
      title="Step title"
      visual={StepCardVisual.Donut}
    />,
  );
  expect(ui.card.get()).toHaveAttribute('aria-pressed', 'false');
});

it('calls onSelect when the card is clicked', async () => {
  const onSelect = jest.fn();
  const { user } = renderStepCard({ onSelect });

  await user.click(ui.card.get());

  expect(onSelect).toHaveBeenCalledTimes(1);
});

it('reports a locked card as unavailable and refuses selection', async () => {
  const onSelect = jest.fn();
  const { user } = renderStepCard({ isLocked: true, onSelect, visual: StepCardVisual.RingLocked });

  // The lock ring is decorative, so the accessible name has to carry the state on its own.
  expect(ui.lockedCard.get()).toHaveAttribute('aria-disabled', 'true');
  expect(ui.card.query()).not.toBeInTheDocument();

  await user.click(ui.lockedCard.get());

  expect(onSelect).not.toHaveBeenCalled();
});

it('does not report an unlocked card as unavailable', () => {
  renderStepCard();

  expect(ui.card.get()).toHaveAttribute('aria-disabled', 'false');
});
