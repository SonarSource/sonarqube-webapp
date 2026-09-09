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

export function NugetLogo({ className }: Readonly<Props>) {
  return (
    <svg
      className={className}
      fill="none"
      height={SIZE}
      version="1.1"
      viewBox="2 2 28 28"
      width={SIZE}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.376,30H14.311a6.721,6.721,0,0,1-6.623-6.8V14.133a6.722,6.722,0,0,1,6.623-6.8h9.065A6.722,6.722,0,0,1,30,14.133V23.2A6.722,6.722,0,0,1,23.376,30Z"
        fill="#004880"
      />
      <path
        d="M27.331,22.813a4.691,4.691,0,1,1-4.69-4.782A4.726,4.726,0,0,1,27.331,22.813Z"
        fill="#fff"
      />
      <path
        d="M13.353,10.733A2.987,2.987,0,1,1,10.4,13.716a2.965,2.965,0,0,1,2.957-2.983Z"
        fill="#fff"
      />
      <path d="M2,4.444A2.407,2.407,0,1,0,4.406,2,2.426,2.426,0,0,0,2,4.444" fill="#004880" />
    </svg>
  );
}
