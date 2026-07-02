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

import { IconFilledProps } from '@sonarsource/echoes-react';
import { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';

function PulseSvg(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <svg
      className={props.className}
      fill="currentColor"
      height={props.height ?? '1em'}
      viewBox="0 0 32 32"
      width={props.width ?? '1em'}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M30.42,16.31a1,1,0,0,1-1,1H24.49l-1,3a1,1,0,0,1-1.94-.05l-1.77-5.61-3.05,9.63a1,1,0,0,1-1.91,0l-4.12-13L9.06,16.61a1,1,0,0,1-1,.7H2.58a1,1,0,0,1,0-2H7.37L9.79,7.68a1,1,0,0,1,1.91,0l4.12,13,3-9.63a1,1,0,0,1,1.91,0l1.8,5.7.24-.76a1,1,0,0,1,1-.7h5.66A1,1,0,0,1,30.42,16.31Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Temporary pulse icon for the Quality Gate History feature. Echoes has no equivalent yet, so this
 * is typed as an Echoes icon to be usable in Echoes `Icon` slots (ButtonIcon, SidebarNavigation.Item).
 * Replace every usage with the Echoes icon once it's available, then delete this file.
 */
export const IconPulse = PulseSvg as unknown as ForwardRefExoticComponent<
  IconFilledProps & RefAttributes<HTMLSpanElement>
>;
