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

import { LogoSize } from '@sonarsource/echoes-react';
import * as React from 'react';
import { Image } from '~adapters/components/common/Image';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  hasText?: boolean;
  size?: LogoSize;
}

const LOGO_SRC = 'images/topsec-logo.svg';
const BRAND_NAME = '天融信AI代码审计平台';

function getAssetPath(filename: string) {
  const globalWindow = window as Window & {
    __assetsPath?: (assetName: string) => string;
  };

  return globalWindow.__assetsPath?.(filename) ?? `/${filename}`;
}

function getLogoSize(size?: LogoSize) {
  switch (size) {
    case LogoSize.Small:
      return 24;
    case LogoSize.Large:
      return 44;
    case LogoSize.Medium:
    default:
      return 32;
  }
}

/**
 * TopSec branded logo replacement for all product logo usages in the webapp.
 */
export function SonarQubeProductLogo({
  className,
  hasText = false,
  size = LogoSize.Medium,
  ...rest
}: Props) {
  const pixelSize = getLogoSize(size);

  return (
    <div
      className={[
        'sw-inline-flex sw-items-center sw-gap-3',
        hasText ? 'sw-justify-start' : 'sw-justify-center',
        className ?? '',
      ].join(' ')}
      {...rest}
    >
      <div className="topsec-brand-logo sw-flex sw-items-center sw-justify-center">
        <Image
          alt={BRAND_NAME}
          height={pixelSize}
          src={getAssetPath(LOGO_SRC)}
          style={{
            maxHeight: `${pixelSize}px`,
            maxWidth: `${pixelSize}px`,
            objectFit: 'contain',
          }}
          width={pixelSize}
        />
      </div>
      {hasText && (
        <span
          className="sw-font-semibold"
          style={{
            color: 'rgb(127, 29, 29)',
            fontSize: size === LogoSize.Large ? '1.125rem' : '0.95rem',
            lineHeight: 1.2,
          }}
        >
          {BRAND_NAME}
        </span>
      )}
    </div>
  );
}
