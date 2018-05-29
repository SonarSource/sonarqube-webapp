/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
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
import * as React from 'react';
import * as classNames from 'classnames';
import { AutoSizer } from 'react-virtualized/dist/commonjs/AutoSizer';
import { Link } from 'react-router';
import { min, max } from 'd3-array';
import { scaleLinear, ScaleLinear } from 'd3-scale';
import { zoom, zoomIdentity } from 'd3-zoom';
import { event, select } from 'd3-selection';
import { sortBy, uniq } from 'lodash';
import Tooltip from '../controls/Tooltip';
import { translate } from '../../helpers/l10n';
import './BubbleChart.css';

const TICKS_COUNT = 5;

interface BubbleProps {
  color?: string;
  link?: string;
  onClick?: (link?: string) => void;
  r: number;
  scale: number;
  tooltip?: string | React.ReactNode;
  x: number;
  y: number;
}

export class Bubble extends React.PureComponent<BubbleProps> {
  handleClick = (event: React.MouseEvent<SVGCircleElement>) => {
    if (this.props.onClick) {
      event.stopPropagation();
      event.preventDefault();
      this.props.onClick(this.props.link);
    }
  };

  render() {
    let circle = (
      <circle
        className="bubble-chart-bubble"
        onClick={this.props.onClick ? this.handleClick : undefined}
        r={this.props.r}
        style={{ fill: this.props.color, stroke: this.props.color }}
        transform={`translate(${this.props.x}, ${this.props.y}) scale(${this.props.scale})`}
      />
    );

    if (this.props.link && !this.props.onClick) {
      circle = <Link to={this.props.link}>{circle}</Link>;
    }

    return (
      <Tooltip overlay={this.props.tooltip || undefined}>
        <g>{circle}</g>
      </Tooltip>
    );
  }
}

interface Item {
  color?: string;
  key?: string;
  link?: any;
  size: number;
  tooltip?: React.ReactNode;
  x: number;
  y: number;
}

interface Props {
  displayXGrid?: boolean;
  displayXTicks?: boolean;
  displayYGrid?: boolean;
  displayYTicks?: boolean;
  formatXTick?: (tick: number) => string;
  formatYTick?: (tick: number) => string;
  height: number;
  items: Item[];
  onBubbleClick?: (link?: string) => void;
  padding?: [number, number, number, number];
  sizeDomain?: [number, number];
  sizeRange?: [number, number];
  xDomain?: [number, number];
  yDomain?: [number, number];
}

interface State {
  transform: { x: number; y: number; k: number };
}

type Scale = ScaleLinear<number, number>;

export default class BubbleChart extends React.Component<Props, State> {
  node: SVGSVGElement | null = null;
  selection: any = null;
  transform: any = null;
  zoom: any = null;

  static defaultProps = {
    displayXGrid: true,
    displayXTicks: true,
    displayYGrid: true,
    displayYTicks: true,
    sizeRange: [5, 45]
  };

  constructor(props: Props) {
    super(props);
    this.state = { transform: { x: 0, y: 0, k: 1 } };
  }

  componentDidUpdate() {
    if (this.zoom && this.node) {
      const rect = this.node.getBoundingClientRect();
      this.zoom.translateExtent([[0, 0], [rect.width, rect.height]]);
    }
  }

  boundNode = (node: SVGSVGElement) => {
    this.node = node;
    this.zoom = zoom()
      .scaleExtent([1, 10])
      .on('zoom', this.zoomed);
    this.selection = select(this.node).call(this.zoom);
  };

  zoomed = () => {
    this.setState({ transform: event.transform });
  };

  resetZoom = (event: React.MouseEvent<Link>) => {
    event.stopPropagation();
    event.preventDefault();
    select(this.node).call(this.zoom.transform, zoomIdentity);
  };

  get formatXTick() {
    return this.props.formatXTick || ((d: number) => String(d));
  }

  get formatYTick() {
    return this.props.formatYTick || ((d: number) => String(d));
  }

  get padding() {
    return this.props.padding || [10, 10, 10, 10];
  }

  getXRange(xScale: Scale, sizeScale: Scale, availableWidth: number) {
    const minX = min(this.props.items, d => xScale(d.x) - sizeScale(d.size)) || 0;
    const maxX = max(this.props.items, d => xScale(d.x) + sizeScale(d.size)) || 0;
    const dMinX = minX < 0 ? xScale.range()[0] - minX : xScale.range()[0];
    const dMaxX = maxX > xScale.range()[1] ? maxX - xScale.range()[1] : 0;
    return [dMinX, availableWidth - dMaxX];
  }

  getYRange(yScale: Scale, sizeScale: Scale, availableHeight: number) {
    const minY = min(this.props.items, d => yScale(d.y) - sizeScale(d.size)) || 0;
    const maxY = max(this.props.items, d => yScale(d.y) + sizeScale(d.size)) || 0;
    const dMinY = minY < 0 ? yScale.range()[1] - minY : yScale.range()[1];
    const dMaxY = maxY > yScale.range()[0] ? maxY - yScale.range()[0] : 0;
    return [availableHeight - dMaxY, dMinY];
  }

  getTicks(scale: Scale, format: (d: number) => string) {
    const zoom = Math.ceil(this.state.transform.k);
    const ticks = scale.ticks(TICKS_COUNT * zoom).map(tick => format(tick));
    const uniqueTicksCount = uniq(ticks).length;
    const ticksCount =
      uniqueTicksCount < TICKS_COUNT * zoom ? uniqueTicksCount - 1 : TICKS_COUNT * zoom;
    return scale.ticks(ticksCount);
  }

  getZoomLevelLabel = () => Math.floor(this.state.transform.k * 100) + '%';

  renderXGrid = (ticks: number[], xScale: Scale, yScale: Scale) => {
    if (!this.props.displayXGrid) {
      return null;
    }

    const { transform } = this.state;
    const lines = ticks.map((tick, index) => {
      const x = xScale(tick);
      const y1 = yScale.range()[0];
      const y2 = yScale.range()[1];
      return (
        <line
          className="bubble-chart-grid"
          key={index}
          x1={x * transform.k + transform.x}
          x2={x * transform.k + transform.x}
          y1={y1 * transform.k}
          y2={transform.k > 1 ? 0 : y2}
        />
      );
    });

    return <g>{lines}</g>;
  };

  renderYGrid = (ticks: number[], xScale: Scale, yScale: Scale) => {
    if (!this.props.displayYGrid) {
      return null;
    }

    const { transform } = this.state;
    const lines = ticks.map((tick, index) => {
      const y = yScale(tick);
      const x1 = xScale.range()[0];
      const x2 = xScale.range()[1];
      return (
        <line
          className="bubble-chart-grid"
          key={index}
          x1={transform.k > 1 ? 0 : x1}
          x2={x2 * transform.k}
          y1={y * transform.k + transform.y}
          y2={y * transform.k + transform.y}
        />
      );
    });

    return <g>{lines}</g>;
  };

  renderXTicks = (xTicks: number[], xScale: Scale, yScale: Scale) => {
    if (!this.props.displayXTicks) {
      return null;
    }

    const { transform } = this.state;
    const ticks = xTicks.map((tick, index) => {
      const x = xScale(tick) * transform.k + transform.x;
      const y = yScale.range()[0];
      const innerText = this.formatXTick(tick);
      return x > 0 ? (
        <text className="bubble-chart-tick" dy="1.5em" key={index} x={x} y={y}>
          {innerText}
        </text>
      ) : null;
    });

    return <g>{ticks}</g>;
  };

  renderYTicks = (yTicks: number[], xScale: Scale, yScale: Scale) => {
    if (!this.props.displayYTicks) {
      return null;
    }

    const { transform } = this.state;
    const ticks = yTicks.map((tick, index) => {
      const x = xScale.range()[0];
      const y = yScale(tick) * transform.k + transform.y;
      const innerText = this.formatYTick(tick);
      return y > 0 && y < this.props.height - 80 ? (
        <text
          className="bubble-chart-tick bubble-chart-tick-y"
          dx="-0.5em"
          dy="0.3em"
          key={index}
          x={x}
          y={y}>
          {innerText}
        </text>
      ) : null;
    });

    return <g>{ticks}</g>;
  };

  renderChart = (width: number) => {
    const { transform } = this.state;
    const availableWidth = width - this.padding[1] - this.padding[3];
    const availableHeight = this.props.height - this.padding[0] - this.padding[2];

    const xScale = scaleLinear()
      .domain(this.props.xDomain || [0, max(this.props.items, d => d.x) || 0])
      .range([0, availableWidth])
      .nice();
    const yScale = scaleLinear()
      .domain(this.props.yDomain || [0, max(this.props.items, d => d.y) || 0])
      .range([availableHeight, 0])
      .nice();
    const sizeScale = scaleLinear()
      .domain(this.props.sizeDomain || [0, max(this.props.items, d => d.size) || 0])
      .range(this.props.sizeRange || []);

    const xScaleOriginal = xScale.copy();
    const yScaleOriginal = yScale.copy();

    xScale.range(this.getXRange(xScale, sizeScale, availableWidth));
    yScale.range(this.getYRange(yScale, sizeScale, availableHeight));

    const bubbles = sortBy(this.props.items, b => -b.size).map((item, index) => {
      return (
        <Bubble
          color={item.color}
          key={item.key || index}
          link={item.link}
          onClick={this.props.onBubbleClick}
          r={sizeScale(item.size)}
          scale={1 / transform.k}
          tooltip={item.tooltip}
          x={xScale(item.x)}
          y={yScale(item.y)}
        />
      );
    });

    const xTicks = this.getTicks(xScale, this.formatXTick);
    const yTicks = this.getTicks(yScale, this.formatYTick);

    return (
      <svg
        className={classNames('bubble-chart')}
        height={this.props.height}
        ref={this.boundNode}
        width={width}>
        <defs>
          <clipPath id="graph-region">
            <rect
              // Extend clip by 2 pixels: one for clipRect border, and one for Bubble borders
              height={this.props.height - this.padding[0] - this.padding[2] + 4}
              width={width + 4}
              x={-2}
              y={-2}
            />
          </clipPath>
        </defs>
        <g transform={`translate(${this.padding[3]}, ${this.padding[0]})`}>
          <g clipPath="url(#graph-region)">
            {this.renderXGrid(xTicks, xScale, yScale)}
            {this.renderYGrid(yTicks, xScale, yScale)}
            <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
              {bubbles}
            </g>
          </g>
          {this.renderXTicks(xTicks, xScale, yScaleOriginal)}
          {this.renderYTicks(yTicks, xScaleOriginal, yScale)}
        </g>
      </svg>
    );
  };

  render() {
    return (
      <div>
        <div className="bubble-chart-zoom">
          <Tooltip overlay={translate('component_measures.bubble_chart.zoom_level')}>
            <Link
              className={classNames('outline-badge', { active: this.state.transform.k > 1 })}
              onClick={this.resetZoom}
              to="#">
              {this.getZoomLevelLabel()}
            </Link>
          </Tooltip>
        </div>
        <AutoSizer disableHeight={true}>{size => this.renderChart(size.width)}</AutoSizer>
      </div>
    );
  }
}
