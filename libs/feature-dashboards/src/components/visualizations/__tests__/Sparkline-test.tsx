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
import { renderWithRouter } from '~shared/helpers/test-utils';
import { Sparkline } from '../Sparkline';

describe('Sparkline', () => {
  it('renders a chart for normal varying data with area and line', () => {
    renderWithRouter(<Sparkline data={[10, 12, 11, 15, 14]} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/dashboard\.sparkline\.aria\.trend_up/),
    );
    expect(img).toHaveAttribute('aria-label', expect.stringMatching(/\+40%/));
    expect(img).toHaveAttribute('height', '30');
    expect(img).toHaveAttribute('width', '80');
    expect(img).toContainHTML('gradientUnits="objectBoundingBox"');
    expect(img).toContainHTML('fill="url(#');
    expect(img).toContainHTML('fill="none"');
    expect(img).toContainHTML('vector-effect="non-scaling-stroke"');
  });

  it('renders a horizontal series for all-equal values', () => {
    renderWithRouter(<Sparkline data={[7, 7, 7, 7]} />);

    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'dashboard.sparkline.aria.flat');
  });

  it('renders a full-width flat line for a single data point', () => {
    renderWithRouter(<Sparkline data={[42]} />);

    const img = screen.getByRole('img');
    /* eslint-disable-next-line testing-library/no-node-access -- stroke path has no role; assert `d` geometry */
    const linePath = img.querySelector('path[fill="none"]');
    const pathD = linePath?.getAttribute('d');
    expect(pathD).toMatch(/^M\d+(?:\.\d+)?,\d+(?:\.\d+)? L\d+(?:\.\d+)?,\d+(?:\.\d+)?$/);
    const match = pathD?.match(
      /^M(?<x1>\d+(?:\.\d+)?),(?<y1>\d+(?:\.\d+)?) L(?<x2>\d+(?:\.\d+)?),(?<y2>\d+(?:\.\d+)?)$/,
    );
    expect(match?.groups).toBeDefined();
    expect(match?.groups?.y1).toBe(match?.groups?.y2);
    expect(img).toHaveAttribute('aria-label', 'dashboard.sparkline.aria.flat');
  });

  it('renders a dotted placeholder when data is empty', () => {
    renderWithRouter(<Sparkline data={[]} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('aria-label', 'dashboard.sparkline.aria.no_historical_data');
    expect(img).toContainHTML('stroke-dasharray="4 4"');
    expect(img).not.toContainHTML('fill="url(#');
  });

  it('stretches to container width when fullWidth is set', () => {
    renderWithRouter(<Sparkline data={[1, 3]} fullWidth />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('width', '100%');
    expect(img).toHaveAttribute('preserveAspectRatio', 'none');
  });
});
