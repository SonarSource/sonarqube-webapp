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

import styled from '@emotion/styled';
import { cssVar } from '@sonarsource/echoes-react';
import tw from 'twin.macro';
import { BUBBLE_BORDER_COLORS, BUBBLE_COLORS } from '../helpers';
import { BubbleColorVal } from '../types';
import { Tooltip } from './Tooltip';
import { Checkbox } from './input/Checkbox';

export interface ColorFilterOption {
  ariaLabel?: string;
  backgroundColor?: string;
  borderColor?: string;
  label: React.ReactNode;
  overlay?: React.ReactNode;
  selected: boolean;
  value: string | number;
}

interface ColorLegendProps {
  className?: string;
  colors: ColorFilterOption[];
  onColorClick: (color: ColorFilterOption) => void;
}

export function ColorsLegend(props: ColorLegendProps) {
  const { className, colors } = props;

  return (
    <ColorsLegendWrapper className={className}>
      {colors.map((color, idx) => (
        <li className="sw-ml-4" key={color.value}>
          <Tooltip content={color.overlay}>
            <div>
              <Checkbox
                checked={color.selected}
                label={color.ariaLabel}
                onCheck={() => {
                  props.onColorClick(color);
                }}
              >
                <ColorRating
                  style={
                    color.selected
                      ? {
                          backgroundColor:
                            color.backgroundColor ?? BUBBLE_COLORS[(idx + 1) as BubbleColorVal],

                          borderColor:
                            color.borderColor ?? BUBBLE_BORDER_COLORS[(idx + 1) as BubbleColorVal],
                        }
                      : {}
                  }
                >
                  {color.label}
                </ColorRating>
              </Checkbox>
            </div>
          </Tooltip>
        </li>
      ))}
    </ColorsLegendWrapper>
  );
}

const ColorsLegendWrapper = styled.ul`
  ${tw`sw-flex`}
`;

const ColorRating = styled.div`
  width: 20px;
  height: 20px;
  line-height: 20px;
  border-radius: 50%;
  border: ${cssVar('border-width-default')} solid ${cssVar('color-border-weak')};
  ${tw`sw-flex sw-justify-center`}
  ${tw`sw-ml-1`}
`;
