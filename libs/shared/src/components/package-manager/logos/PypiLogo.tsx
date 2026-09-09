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

export function PypiLogo({ className }: Readonly<Props>) {
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
      <path
        d="M6.45685 0.5C3.41036 0.5 3.60049 1.82112 3.60049 1.82112L3.60424 3.18986H6.51123V3.60049H2.44887C2.44887 3.60049 0.5 3.37924 0.5 6.45348C0.5 9.52697 2.20137 9.41822 2.20137 9.41822H3.21687V7.99172C3.21687 7.99172 3.16211 6.29035 4.89123 6.29035H7.77422C7.77422 6.29035 9.39422 6.3166 9.39422 4.72473V2.09262C9.39422 2.09262 9.64021 0.5 6.45685 0.5ZM4.85373 1.42025C5.14286 1.42025 5.37686 1.65425 5.37686 1.94337C5.37686 2.23249 5.14286 2.46649 4.85373 2.46649C4.78501 2.46659 4.71694 2.45313 4.65343 2.42687C4.58991 2.40062 4.53221 2.36209 4.48361 2.31349C4.43501 2.2649 4.39648 2.20719 4.37023 2.14368C4.34398 2.08016 4.33051 2.01209 4.33061 1.94337C4.33061 1.65425 4.56461 1.42025 4.85373 1.42025Z"
        fill="url(#paint0_linear_4890_2393)"
      />
      <path
        d="M6.54309 12.4374C9.58958 12.4374 9.39945 11.1162 9.39945 11.1162L9.3957 9.7475H6.48872V9.33687H10.5507C10.5507 9.33687 12.4999 9.55812 12.4999 6.48426C12.4999 3.4104 10.7986 3.51952 10.7986 3.51952H9.78308V4.94564C9.78308 4.94564 9.83783 6.64701 8.10871 6.64701H5.22572C5.22572 6.64701 3.60573 6.62076 3.60573 8.21263V10.8447C3.60573 10.8447 3.35973 12.4374 6.54309 12.4374ZM8.14621 11.5171C8.07748 11.5172 8.00942 11.5038 7.9459 11.4775C7.88239 11.4512 7.82468 11.4127 7.77609 11.3641C7.72749 11.3155 7.68896 11.2578 7.66271 11.1943C7.63645 11.1308 7.62299 11.0627 7.62309 10.994C7.62309 10.7052 7.85709 10.4712 8.14621 10.4712C8.43533 10.4712 8.66933 10.7049 8.66933 10.994C8.66933 11.2835 8.43533 11.5171 8.14621 11.5171Z"
        fill="url(#paint1_linear_4890_2393)"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint0_linear_4890_2393"
          x1="1.65312"
          x2="7.58672"
          y1="1.54325"
          y2="7.49672"
        >
          <stop stopColor="#387EB8" />
          <stop offset="1" stopColor="#366994" />
        </linearGradient>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="paint1_linear_4890_2393"
          x1="5.30335"
          x2="11.6761"
          y1="5.33077"
          y2="11.4361"
        >
          <stop stopColor="#FFE052" />
          <stop offset="1" stopColor="#FFC331" />
        </linearGradient>
      </defs>
    </svg>
  );
}
