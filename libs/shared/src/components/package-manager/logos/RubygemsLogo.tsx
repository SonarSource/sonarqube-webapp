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

export function RubygemsLogo({ className }: Readonly<Props>) {
  return (
    <svg
      className={className}
      enableBackground="new 0 0 200 200"
      fill="none"
      height={SIZE}
      version="1.1"
      viewBox="21.7 10.6 157 180"
      width={SIZE}
      x="0px"
      xmlSpace="preserve"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      y="0px"
    >
      <g>
        <polygon
          fill="#d6422b"
          points="68.8,69.9 68.7,69.8 46.5,92 100.4,145.8 122.6,123.7 154.3,92 132.1,69.8 132.1,69.7 68.7,69.7 &#9; &#9;&#9;"
        />
        <path
          d="M100.2,10.6l-78.5,45v90l78.5,45l78.5-45v-90L100.2,10.6z M163.7,137l-63.5,36.6L36.7,137V64l63.5-36.6 &#9;&#9;L163.7,64V137z"
          fill="#d6422b"
        />
      </g>
    </svg>
  );
}
