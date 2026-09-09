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

export function ComposerLogo({ className }: Readonly<Props>) {
  return (
    <svg
      className={className}
      fill="none"
      height={SIZE}
      preserveAspectRatio="xMidYMid"
      version="1.1"
      viewBox="0 0 134.52338 109.70831"
      width={SIZE}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path
          d="m 29.5,62.5 -8.2,4.4 c -0.4,0.2 -0.4,0.8 0,1 l 8.2,4.4 c 0.4,0.2 0.9,-0.1 0.9,-0.5 V 63 c 0,-0.4 -0.5,-0.7 -0.9,-0.5 z"
          fill="#E0743F"
          stroke="#E0743F"
        />
        <path
          d="M 82,94.6 H 76.7 V 65.2 l 5.6,-2.6 0.7,0.2 v 30.9 c 0,0.5 -0.4,0.9 -1,0.9 z"
          fill="#C15934"
          stroke="#C15934"
        />
        <path d="m 108,58.6 5.8,-6.6 c 0,0 4.2,7.9 4.2,7.8 z" fill="#E0743F" stroke="#E0743F" />
        <path
          d="m 46.3,37.7 c -0.2,0.3 -0.4,0.6 -0.4,1 v 5.8 c 0,0.5 -0.3,1.1 -0.8,1.3 L 32.3,53 c -0.8,0.4 -1,1.4 -0.5,2.1 L 52.6,86.5 42.2,97 c -0.3,0.3 -0.6,0.4 -1.1,0.4 h -10 c -0.8,0 -1.5,-0.7 -1.5,-1.5 V 43.2 c 0,-0.5 0.2,-1 0.7,-1.3 l 16.8,-11 c 0.2,-0.2 0.5,-0.2 0.8,-0.2 h 4.9 z"
          fill="#C15934"
          stroke="#C15934"
        />
        <path
          d="M 76.7,96.6 V 65.2 L 46.9,65.1 c -0.5,0 -1,-0.4 -1,-1 V 45.4 l -14.2,7.9 c -0.5,0.3 -0.6,0.9 -0.3,1.4 L 60.5,97 c 0.2,0.3 0.5,0.4 0.8,0.4 h 14.5 c 0.6,0.1 1,-0.3 0.9,-0.8 z"
          fill="#E0743F"
          stroke="#E0743F"
        />
        <g id="g240">
          <path
            d="m 63.6,27.3 c -0.2,0 -0.3,-0.1 -0.3,-0.3 v -9 c 0,-0.1 0.1,-0.2 0.1,-0.3 0.1,0 0.1,0 0.2,0 0,0 0.1,0 0.1,0 l 16.8,9 c 0.1,0.1 0.2,0.2 0.1,0.3 0,0.1 -0.1,0.2 -0.3,0.2 0.1,0.1 -16.7,0.1 -16.7,0.1 z"
            fill="#C15934"
          />
          <path
            d="m 63.6,18 16.8,9 H 63.6 v -9 m 0,-0.6 c -0.1,0 -0.2,0 -0.3,0.1 C 63.1,17.6 63,17.8 63,18 v 9 c 0,0.3 0.3,0.6 0.6,0.6 h 16.8 c 0.3,0 0.5,-0.2 0.6,-0.4 0.1,-0.2 -0.1,-0.5 -0.3,-0.7 l -16.8,-9 c -0.1,0 -0.2,-0.1 -0.3,-0.1 z"
            fill="#C15934"
          />
        </g>
        <polygon
          fill="#C15934"
          points="113.8,52 100.9,66.8 95.3,58.1 95,56.5 101.4,50.4 "
          stroke="#C15934"
        />
        <path
          d="M 82.4,62.6 76.8,65.2 52.8,30.7 61,27 c 0.2,-0.1 0.4,-0.1 0.7,-0.1 h 19.1 l 10,7.9 c 0.4,0.3 0.6,0.7 0.7,1.1 l 3.8,22.2 5.5,8.7 z"
          fill="#E0743F"
          stroke="#E0743F"
        />
        <path
          d="m 46.9,65 29.8,0.1 -24,-34.5 -6.4,7 C 46.1,38 46,38.4 46,38.8 V 64 c 0,0.6 0.4,1 0.9,1 z"
          fill="#E58B59"
          stroke="#E58B59"
        />
      </g>
    </svg>
  );
}
