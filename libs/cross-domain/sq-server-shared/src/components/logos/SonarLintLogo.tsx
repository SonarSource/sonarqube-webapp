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

import { uniqueId } from 'lodash';
import * as React from 'react';
import { isDefined } from '../../helpers/types';

interface Props {
  className?: string;
  description?: React.ReactNode;
}

const SIZE = 16;

export function SonarLintLogo({ className, description }: Readonly<Props>) {
  const id = uniqueId('icon');
  return (
    <svg
      className={className}
      fill="none"
      height={SIZE}
      version="1.1"
      viewBox="0 0 36 37"
      width={SIZE}
      xmlns="http://www.w3.org/2000/svg"
      aria-describedby={isDefined(description) && description !== '' ? id : undefined}
    >
      {isDefined(description) && description !== '' && <desc id={id}>{description}</desc>}
      <path
        d="M35.2491 20.4953C35.2491 21.4158 34.1958 21.9573 33.46 21.4081C32.6546 20.797 32.1357 19.8378 31.7174 19.0565C31.1443 17.989 30.7571 17.3392 30.2459 17.3392C29.7348 17.3392 29.3475 17.989 28.7744 19.0565C28.1083 20.3019 27.1944 22.0037 25.2427 22.0037C23.291 22.0037 22.3771 20.3019 21.7111 19.0565C21.1379 17.989 20.7584 17.3392 20.2395 17.3392C19.7206 17.3392 19.3411 17.989 18.7757 19.0565C18.1097 20.3019 17.1958 22.0037 15.2518 22.0037C13.3079 22.0037 12.3862 20.3019 11.7202 19.0565C11.147 17.989 10.7675 17.3392 10.2486 17.3392C9.72973 17.3392 9.35023 17.989 8.77711 19.0565C8.11105 20.3019 7.19716 22.0037 5.24545 22.0037C3.29374 22.0037 2.37984 20.3019 1.71378 19.0565C1.31105 18.3062 1.009 17.7647 0.683714 17.5094C0.428133 17.3083 0.25 17.0298 0.25 16.6972V16.5115C0.25 15.591 1.3033 15.0495 2.03907 15.5987C2.84453 16.2098 3.3557 17.169 3.77392 17.9503C4.34704 19.0178 4.72654 19.6676 5.2377 19.6676C5.74886 19.6676 6.13611 19.0178 6.70149 17.9503C7.36754 16.7049 8.28144 15.0031 10.2331 15.0031C12.1849 15.0031 13.0988 16.7049 13.7648 17.9503C14.3379 19.0178 14.7174 19.6676 15.2363 19.6676C15.7552 19.6676 16.1347 19.0178 16.7001 17.9503C17.3662 16.7049 18.2801 15.0031 20.224 15.0031C22.168 15.0031 23.0896 16.7049 23.7557 17.9503C24.3288 19.0178 24.7083 19.6676 25.2272 19.6676C25.7461 19.6676 26.1256 19.0178 26.6988 17.9503C27.3648 16.7049 28.2787 15.0031 30.2304 15.0031C32.1821 15.0031 33.096 16.7049 33.7621 17.9503C34.1648 18.7007 34.4746 19.2422 34.7999 19.4974C35.0555 19.6985 35.2336 19.9848 35.2336 20.3096V20.4953H35.2491Z"
        fill="var(--echoes-logos-colors-brand)"
      />
      <path
        d="M18.0632 36.5C13.85 36.5 9.83816 35.0535 6.60855 32.3847C6.08964 31.9593 6.05091 31.1703 6.51561 30.6829C6.94157 30.2343 7.63087 30.2033 8.11105 30.5901C11.0309 33.0036 14.6787 34.2645 18.5047 34.1562C22.3307 34.0556 25.9088 32.6013 28.6892 30.0409C29.1461 29.6232 29.8354 29.6232 30.2846 30.0409C30.7726 30.505 30.7726 31.2863 30.2846 31.7504C27.0783 34.6976 22.9657 36.3685 18.5744 36.4845C18.4117 36.4845 18.2414 36.4845 18.0787 36.4845L18.0632 36.5Z"
        fill="var(--echoes-logos-colors-brand)"
      />
      <path
        d="M5.87278 6.94275C5.38485 6.47862 5.38485 5.6896 5.88053 5.23321C9.17985 2.2009 13.3698 0.622866 17.5908 0.506834C21.8117 0.390802 26.0792 1.75225 29.5334 4.5989C30.0523 5.03209 30.0988 5.81337 29.6341 6.3007C29.2081 6.74936 28.5188 6.7803 28.0464 6.39353C25.0646 3.93365 21.3935 2.75786 17.7534 2.82748C14.1133 2.8971 10.3648 4.28175 7.46048 6.94275C7.01128 7.36047 6.31424 7.35273 5.86504 6.93501L5.87278 6.94275Z"
        fill="var(--echoes-logos-colors-brand)"
      />
    </svg>
  );
}
