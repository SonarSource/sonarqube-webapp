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

interface Props {
  readonly className?: string;
  readonly fill?: string;
  readonly height?: number;
  readonly width?: number;
}

/*
 * Temporary Icon. To remove when echoes gets the proper icon.
 */
export function ShieldOffIcon({
  fill = '#637192',
  width = 20,
  height = 20,
  ...iconProps
}: Readonly<Props>) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...iconProps}
    >
      <path
        d="M14.3582 12.2459L15.4832 13.3918C15.8166 12.7112 16.0666 12.0272 16.2332 11.3397C16.3999 10.6522 16.4832 9.96121 16.4832 9.26676V5.51676C16.4832 5.19732 16.3964 4.9126 16.2228 4.6626C16.0492 4.4126 15.8166 4.23204 15.5249 4.12093L10.5249 2.20426C10.3443 2.13482 10.1638 2.1001 9.98324 2.1001C9.80268 2.1001 9.62212 2.13482 9.44157 2.20426L5.73324 3.64176L6.8999 4.7876L9.98324 3.62093L14.9832 5.5376V9.26676C14.9832 9.75288 14.9312 10.2494 14.827 10.7563C14.7228 11.2633 14.5666 11.7598 14.3582 12.2459Z"
        fill={fill}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.50407 17.8293C9.79574 17.8848 9.95546 17.9126 9.98324 17.9126C10.0666 17.9126 10.1499 17.9057 10.2332 17.8918C10.3166 17.8779 10.393 17.857 10.4624 17.8293C11.1013 17.6209 11.6846 17.364 12.2124 17.0584C12.7402 16.7529 13.2471 16.357 13.7332 15.8709L15.4832 17.6001C15.636 17.7529 15.8131 17.8293 16.0145 17.8293C16.2159 17.8293 16.393 17.7529 16.5457 17.6001C16.6985 17.4473 16.7749 17.2737 16.7749 17.0793C16.7749 16.8848 16.6985 16.7112 16.5457 16.5584L3.44157 3.45426C3.28879 3.30149 3.11171 3.2251 2.91032 3.2251C2.70893 3.2251 2.53185 3.30149 2.37907 3.45426C2.22629 3.60704 2.1499 3.78413 2.1499 3.98551C2.1499 4.1869 2.22629 4.36399 2.37907 4.51676L3.48324 5.62093V9.26676C3.48324 11.1973 4.02837 12.9508 5.11865 14.5272C6.20893 16.1036 7.67074 17.2043 9.50407 17.8293ZM11.452 15.7459C11.0006 16.0237 10.511 16.2529 9.98324 16.4334C8.46935 15.9195 7.25754 14.9994 6.34782 13.673C5.4381 12.3466 4.98324 10.8779 4.98324 9.26676V7.12093L7.21907 9.35677C6.83634 9.60153 6.41157 9.82702 5.98321 9.99596C6.45628 10.1825 6.90386 10.4177 7.31998 10.6954C7.41268 10.7573 7.50382 10.8213 7.59333 10.8874C8.1649 11.309 8.67012 11.8143 9.09182 12.3858C9.15786 12.4754 9.22185 12.5665 9.28373 12.6592C9.56149 13.0753 9.79664 13.5229 9.98321 13.996C10.1492 13.575 10.3858 13.1438 10.6272 12.7649L12.6499 14.7876C12.3027 15.1487 11.9034 15.4682 11.452 15.7459Z"
        fill={fill}
      />
      <path
        d="M12.7292 10.6409C13.1218 10.3868 13.5414 10.1701 13.9832 9.99585C13.5102 9.80927 13.0626 9.57412 12.6465 9.29636C12.5538 9.23449 12.4626 9.17049 12.3731 9.10445C11.8016 8.68276 11.2963 8.17754 10.8746 7.60596C10.8086 7.51645 10.7446 7.42532 10.6827 7.33262C10.405 6.9165 10.1698 6.46892 9.98324 5.99585C9.80957 6.4362 9.59381 6.85447 9.34077 7.24583L12.7292 10.6409Z"
        fill={fill}
      />
    </svg>
  );
}
