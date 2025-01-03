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
export function ShieldOnIcon({
  fill = '#5D6CD0',
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
        d="M10 17.9126C9.91667 17.9126 9.83333 17.9091 9.75 17.9022C9.66667 17.8952 9.59028 17.8779 9.52083 17.8501C7.70139 17.2529 6.24306 16.1487 5.14583 14.5376C4.04861 12.9265 3.5 11.1695 3.5 9.26676V5.51676C3.5 5.20163 3.58681 4.91795 3.76042 4.66572C3.93403 4.41364 4.16667 4.23204 4.45833 4.12093L9.45833 2.20426C9.63889 2.13482 9.81944 2.1001 10 2.1001C10.1806 2.1001 10.3611 2.13482 10.5417 2.20426L15.5417 4.12093C15.8333 4.23204 16.066 4.41364 16.2396 4.66572C16.4132 4.91795 16.5 5.20163 16.5 5.51676V9.26676C16.5 11.1695 15.9514 12.9265 14.8542 14.5376C13.7569 16.1487 12.2986 17.2529 10.4792 17.8501C10.4097 17.8779 10.3333 17.8952 10.25 17.9022C10.1667 17.9091 10.0833 17.9126 10 17.9126ZM10 16.4334C11.4444 15.9855 12.6389 15.0897 13.5833 13.7459C14.5278 12.4022 15 10.9091 15 9.26676V5.51676L10 3.6001L5 5.51676V9.26676C5 10.9091 5.47222 12.4022 6.41667 13.7459C7.36111 15.0897 8.55556 15.9855 10 16.4334Z"
        fill={fill}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.61012 9.10445C7.52061 9.1705 7.42947 9.23449 7.33677 9.29636C6.92065 9.57412 6.47307 9.80927 6 9.99585C6.47307 10.1824 6.92065 10.4176 7.33677 10.6953C7.42947 10.7572 7.5206 10.8212 7.61011 10.8872C8.18169 11.3089 8.68691 11.8142 9.1086 12.3857C9.17464 12.4752 9.23864 12.5664 9.30051 12.6591C9.57827 13.0752 9.81342 13.5228 10 13.9958C10.1866 13.5228 10.4217 13.0752 10.6995 12.6591C10.7614 12.5664 10.8254 12.4752 10.8914 12.3857C11.3131 11.8142 11.8183 11.3089 12.3899 10.8872C12.4794 10.8212 12.5705 10.7572 12.6632 10.6953C13.0794 10.4176 13.5269 10.1824 14 9.99585C13.5269 9.80927 13.0794 9.57412 12.6632 9.29636C12.5705 9.23449 12.4794 9.17049 12.3899 9.10445C11.8183 8.68276 11.3131 8.17754 10.8914 7.60596C10.8254 7.51645 10.7614 7.42532 10.6995 7.33262C10.4217 6.9165 10.1866 6.46892 10 5.99585C9.81342 6.46892 9.57827 6.9165 9.30051 7.33262C9.23864 7.42532 9.17465 7.51646 9.10861 7.60597C8.68691 8.17754 8.18169 8.68276 7.61012 9.10445ZM8.90288 9.99585C9.30087 10.3278 9.6681 10.695 10 11.093C10.3319 10.695 10.6991 10.3278 11.0971 9.99585C10.6991 9.66395 10.3319 9.29672 10 8.89873C9.6681 9.29672 9.30087 9.66395 8.90288 9.99585Z"
        fill={fill}
      />
    </svg>
  );
}
