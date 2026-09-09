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

interface Props {
  className?: string;
}

const SIZE = 16;

export function CocoapodsLogo({ className }: Readonly<Props>) {
  return (
    <svg
      className={className}
      fill="none"
      height={SIZE}
      preserveAspectRatio="xMidYMid"
      version="1.1"
      viewBox="0 0 255.35 255.35"
      width={SIZE}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M255.349 255.35H0V0h255.349v255.35z" fill="#FA2A00" />
      <path
        d="M160.993 135.984c-3.837 21.052-21.917 38.274-49.807 38.274-33.316 0-53.375-24.471-53.375-52.361 0-27.33 19.066-52.389 53.084-52.389 29.18 0 47.261 18.357 49.956 41.267H136.8c-2.128-11.667-10.959-20.484-25.613-20.484-19.08 0-29.89 15.086-29.89 31.606 0 17.499 12.094 31.593 30.174 31.593 13.377 0 22.2-7.689 25.045-17.506h24.478zM188.93 71.835l-14.698 6.298 18.42 43.076-18.427 43.09 14.704 6.285 12.363-29.117.064.134 8.554-20.392-20.98-49.374z"
        fill="#FFF"
      />
    </svg>
  );
}
