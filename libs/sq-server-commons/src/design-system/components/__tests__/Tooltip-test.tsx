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
import { FCProps } from '../../../types/misc';
import { render } from '../../helpers/testUtils';
import { Tooltip, TooltipInner } from '../Tooltip';

describe('TooltipInner', () => {
  it('should open & close', async () => {
    const onShow = jest.fn();
    const onHide = jest.fn();
    const { user } = setupWithProps({ onHide, onShow });

    await user.hover(screen.getByRole('note'));
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    expect(onShow).toHaveBeenCalled();

    await user.unhover(screen.getByRole('note'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(onHide).toHaveBeenCalled();
  });

  it('should not shadow children pointer events', async () => {
    const onShow = jest.fn();
    const onHide = jest.fn();
    const onPointerEnter = jest.fn();
    const onPointerLeave = jest.fn();
    const { user } = setupWithProps(
      { onHide, onShow },
      <div onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} role="note" />,
    );

    await user.hover(screen.getByRole('note'));
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    expect(onShow).toHaveBeenCalled();
    expect(onPointerEnter).toHaveBeenCalled();

    await user.unhover(screen.getByRole('note'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(onHide).toHaveBeenCalled();
    expect(onPointerLeave).toHaveBeenCalled();
  });

  it('should not open when mouse goes away quickly', async () => {
    const { user } = setupWithProps();

    await user.hover(screen.getByRole('note'));
    await user.unhover(screen.getByRole('note'));

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('should position the tooltip correctly', async () => {
    const onShow = jest.fn();
    const onHide = jest.fn();
    const { user } = setupWithProps({ onHide, onShow });

    await user.hover(screen.getByRole('note'));
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveClass('bottom');
  });

  it('should position the tooltip relative to the trigger element, not the wrapper span', async () => {
    // This test guards against the display:contents getBoundingClientRect regression.
    // The <span style="display:contents"> wrapper returns an all-zero rect in Chromium,
    // so positionTooltip must use firstElementChild (the actual trigger) instead.
    // JSDOM returns zero rects for everything, so we mock the trigger to return a
    // known non-zero rect and assert the tooltip is positioned relative to it.
    const { user } = setupWithProps();
    const trigger = screen.getByRole('note');

    // Without the mock, JSDOM returns all zeros — tooltip renders at top: 0px.
    // With the mock on the trigger element, tooltip top should be > 0.
    // If the bug were present (measuring the display:contents span instead),
    // the span's getBoundingClientRect would still return zeros and top would be 0.
    jest.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      left: 200,
      bottom: 120,
      right: 250,
      width: 50,
      height: 20,
      x: 200,
      y: 100,
      toJSON: () => ({}),
    });

    await user.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');

    // The exact pixel value depends on boundary clamping, but it must be non-zero —
    // proving that the trigger's rect (not the all-zero display:contents span) was used.
    const topValue = parseInt(tooltip.style.top, 10);

    expect(topValue).toBeGreaterThan(0);
  });

  it('should be opened/hidden using tab navigation', async () => {
    const { user } = setupWithProps({}, <a href="#">Link</a>);

    await user.tab();
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    await user.tab();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  function setupWithProps(
    props: Partial<TooltipInner['props']> = {},
    children = <div role="note" />,
  ) {
    return render(
      <TooltipInner content={<span id="overlay" />} mouseLeaveDelay={0} {...props}>
        {children}
      </TooltipInner>,
    );
  }
});

describe('Tooltip', () => {
  it('should not render tooltip without overlay', async () => {
    const { user } = setupWithProps({ content: undefined });
    await user.hover(screen.getByRole('note'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('should not render undefined tooltips', async () => {
    const { user } = setupWithProps({ content: undefined, visible: true });
    await user.hover(screen.getByRole('note'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('should not render empty tooltips', async () => {
    const { user } = setupWithProps({ content: '', visible: true });
    await user.hover(screen.getByRole('note'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  function setupWithProps(
    props: Partial<FCProps<typeof Tooltip>> = {},
    children = <div role="note" />,
  ) {
    return render(
      <Tooltip content={<span id="overlay" />} {...props}>
        {children}
      </Tooltip>,
    );
  }
});
