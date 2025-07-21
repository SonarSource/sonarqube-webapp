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

import { cssVar, EchoesCSSVarString } from '@sonarsource/echoes-react';
import { AiCodeAssuranceStatus } from '../../api/ai-code-assurance';
import { ShieldCheckIcon } from '../ui/icon/ShieldCheckIcon';
import { ShieldCrossIcon } from '../ui/icon/ShieldCrossIcon';
import { ShieldOffIcon } from '../ui/icon/ShieldOffIcon';
import { ShieldOnIcon } from '../ui/icon/ShieldOnIcon';

export enum AiIconColor {
  Disable = 'disable',
  Default = 'default',
  Accent = 'accent',
  Subtle = 'subtle',
}

export enum AiIconVariant {
  On,
  Off,
  Check,
  Cross,
}

interface Props {
  className?: string;
  color?: AiIconColor;
  height?: number;
  variant?: Exclude<AiCodeAssuranceStatus, AiCodeAssuranceStatus.NONE>;
  width?: number;
}

export default function AIAssuredIcon({
  color,
  variant = AiCodeAssuranceStatus.AI_CODE_ASSURED_ON,
  className,
  width = 20,
  height = 20,
}: Readonly<Props>) {
  const Comp = VariantComp[variant];
  return (
    <Comp
      className={className}
      fill={color && AI_ICON_COLOR[color]}
      height={height}
      width={width}
    />
  );
}

const VariantComp = {
  [AiCodeAssuranceStatus.AI_CODE_ASSURED_PASS]: ShieldCheckIcon,
  [AiCodeAssuranceStatus.AI_CODE_ASSURED_ON]: ShieldOnIcon,
  [AiCodeAssuranceStatus.AI_CODE_ASSURED_FAIL]: ShieldCrossIcon,
  [AiCodeAssuranceStatus.AI_CODE_ASSURED_OFF]: ShieldOffIcon,
};

const AI_ICON_COLOR: Record<AiIconColor, EchoesCSSVarString> = {
  [AiIconColor.Disable]: cssVar('color-icon-disabled'),
  [AiIconColor.Default]: cssVar('color-icon-default'),
  [AiIconColor.Accent]: cssVar('color-icon-accent'),
  [AiIconColor.Subtle]: cssVar('color-icon-subtle'),
};
