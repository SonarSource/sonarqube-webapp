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

import { render } from '../../../helpers/test-utils';
import { DataPoint, DonutChart, DonutChartProps } from '../DonutChart';

const DATA: DataPoint[] = [
  { fill: 'red', value: 30 },
  { fill: 'green', value: 50 },
  { fill: 'blue', value: 20 },
];

it('should render one sector per data point with the matching fill', () => {
  const { container } = setupWithProps();

  const paths = getPaths(container);
  expect(paths).toHaveLength(DATA.length);
  expect(paths[0]).toHaveStyle({ fill: 'red' });
  expect(paths[1]).toHaveStyle({ fill: 'green' });
  expect(paths[2]).toHaveStyle({ fill: 'blue' });

  // Every sector should have a non-empty arc path.
  paths.forEach((path) => {
    expect(path).toHaveAttribute('d', expect.stringMatching(/.+/));
  });
});

it('should render the svg with the requested dimensions and class', () => {
  const { container } = setupWithProps({ height: 80, width: 120 });

  const svg = getSvg(container);
  expect(svg).toHaveAttribute('height', '80');
  expect(svg).toHaveAttribute('width', '120');
});

it('should forward aria attributes to the svg', () => {
  const { container } = setupWithProps({ 'aria-label': 'Coverage chart', 'aria-hidden': true });

  const svg = getSvg(container);
  expect(svg).toHaveAttribute('aria-label', 'Coverage chart');
  expect(svg).toHaveAttribute('aria-hidden', 'true');
});

it('should render nothing but the svg when data is empty', () => {
  const { container } = setupWithProps({ data: [] });

  expect(getSvg(container)).toBeInTheDocument();
  expect(getPaths(container)).toHaveLength(0);
});

it('should apply padding to the outer group transform', () => {
  const { container } = setupWithProps({ padding: [10, 20, 30, 40] });

  const outerGroup = getSvg(container).querySelector('g');
  expect(outerGroup).toHaveAttribute('transform', 'translate(40, 10)');
});

it('should give a visible sector to a zero-value slice when minPercent is set', () => {
  const data: DataPoint[] = [
    { fill: 'red', value: 0 },
    { fill: 'green', value: 100 },
  ];

  const withoutMinPercent = getPaths(setupWithProps({ data }).container)[0].getAttribute('d');
  const withMinPercent = getPaths(
    setupWithProps({ data, minPercent: 10 }).container,
  )[0].getAttribute('d');

  // The zero-value slice is invisible by default but gains a visible arc with minPercent.
  expect(withoutMinPercent).not.toEqual(withMinPercent);
  expect(withMinPercent).toBeDefined();
});

it('should change sector geometry when cornerRadius, padAngle or thickness change', () => {
  const base = getPaths(setupWithProps().container)[0].getAttribute('d');
  const withCornerRadius = getPaths(setupWithProps({ cornerRadius: 5 }).container)[0].getAttribute(
    'd',
  );
  const withPadAngle = getPaths(setupWithProps({ padAngle: 0.1 }).container)[0].getAttribute('d');
  const withThickness = getPaths(setupWithProps({ thickness: 30 }).container)[0].getAttribute('d');

  expect(withCornerRadius).not.toEqual(base);
  expect(withPadAngle).not.toEqual(base);
  expect(withThickness).not.toEqual(base);
});

function getSvg(container: HTMLElement) {
  return container.querySelector<SVGSVGElement>('svg.donut-chart') as SVGSVGElement;
}

function getPaths(container: HTMLElement) {
  return Array.from(container.querySelectorAll('path'));
}

function setupWithProps(props: Partial<DonutChartProps> = {}) {
  return render(<DonutChart data={DATA} height={100} thickness={10} width={100} {...props} />);
}
