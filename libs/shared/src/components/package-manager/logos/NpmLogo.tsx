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

export function NpmLogo({ className }: Readonly<Props>) {
  return (
    <svg
      className={className}
      fill="none"
      height={SIZE}
      version="1.1"
      viewBox="0 0 13 13"
      width={SIZE}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_4890_124)">
        <path
          d="M1.56616 1.53711V12.543H12.572V1.53711H1.56616ZM10.7268 10.6987H8.88163V5.22658H7.03643V10.6987H3.41043V3.38231H10.7268V10.6987Z"
          fill="#CB3837"
        />
      </g>
      <defs>
        <clipPath id="clip0_4890_124">
          <rect fill="white" height="14" width="14" />
        </clipPath>
      </defs>
    </svg>
  );
}
