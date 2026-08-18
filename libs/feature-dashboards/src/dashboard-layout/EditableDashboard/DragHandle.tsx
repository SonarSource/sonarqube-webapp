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

import { cssVar } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';

type Props = {
  /**
   * When true, renders the drag handle horizontally (8×10px).
   * When false, renders it vertically (10×8px, section drag handle).
   */
  isHorizontal?: boolean;
  /**
   * When set, rendered as the SVG `<title>`. Omit when a parent supplies the accessible name
   * (e.g. multigrid section row `aria-label`). Widgets pass `dashboard.drag_to_reorder`; section
   * drag ghost passes `dashboard.drag_section_to_reorder`.
   */
  titleMessageId?: string;
};

export function DragHandle(props: Readonly<Props> = {}) {
  const { formatMessage } = useIntl();
  const { isHorizontal = false, titleMessageId } = props;

  const height = isHorizontal ? 8 : 10;
  const width = isHorizontal ? 10 : 8;

  return (
    <div
      style={{
        color: cssVar('color-icon-subtle'),
        cursor: 'grab',
        lineHeight: 0,
      }}
    >
      <svg
        fill="none"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        xmlns="http://www.w3.org/2000/svg"
      >
        {titleMessageId ? <title>{formatMessage({ id: titleMessageId })}</title> : null}
        <g transform={isHorizontal ? 'translate(10 0) rotate(90)' : undefined}>
          <path
            d="M1.99655 9.8002C1.66555 9.8002 1.38338 9.68236 1.15005 9.4467C0.916716 9.21103 0.800049 8.9277 0.800049 8.5967C0.800049 8.2657 0.917882 7.98353 1.15355 7.7502C1.38922 7.51686 1.67255 7.4002 2.00355 7.4002C2.33455 7.4002 2.61672 7.51803 2.85005 7.7537C3.08338 7.98936 3.20005 8.2727 3.20005 8.6037C3.20005 8.9347 3.08222 9.21686 2.84655 9.4502C2.61088 9.68353 2.32755 9.8002 1.99655 9.8002ZM5.99655 9.8002C5.66555 9.8002 5.38338 9.68236 5.15005 9.4467C4.91672 9.21103 4.80005 8.9277 4.80005 8.5967C4.80005 8.2657 4.91788 7.98353 5.15355 7.7502C5.38922 7.51686 5.67255 7.4002 6.00355 7.4002C6.33455 7.4002 6.61672 7.51803 6.85005 7.7537C7.08338 7.98936 7.20005 8.2727 7.20005 8.6037C7.20005 8.9347 7.08222 9.21686 6.84655 9.4502C6.61088 9.68353 6.32755 9.8002 5.99655 9.8002ZM1.99655 6.2002C1.66555 6.2002 1.38338 6.08236 1.15005 5.8467C0.916716 5.61103 0.800049 5.3277 0.800049 4.9967C0.800049 4.6657 0.917882 4.38353 1.15355 4.1502C1.38922 3.91686 1.67255 3.8002 2.00355 3.8002C2.33455 3.8002 2.61672 3.91803 2.85005 4.1537C3.08338 4.38936 3.20005 4.6727 3.20005 5.0037C3.20005 5.3347 3.08222 5.61686 2.84655 5.8502C2.61088 6.08353 2.32755 6.2002 1.99655 6.2002ZM5.99655 6.2002C5.66555 6.2002 5.38338 6.08236 5.15005 5.8467C4.91672 5.61103 4.80005 5.3277 4.80005 4.9967C4.80005 4.6657 4.91788 4.38353 5.15355 4.1502C5.38922 3.91686 5.67255 3.8002 6.00355 3.8002C6.33455 3.8002 6.61672 3.91803 6.85005 4.1537C7.08338 4.38936 7.20005 4.6727 7.20005 5.0037C7.20005 5.3347 7.08222 5.61686 6.84655 5.8502C6.61088 6.08353 6.32755 6.2002 5.99655 6.2002ZM1.99655 2.6002C1.66555 2.6002 1.38338 2.48236 1.15005 2.2467C0.916716 2.01103 0.800049 1.72769 0.800049 1.3967C0.800049 1.06569 0.917882 0.783529 1.15355 0.550195C1.38922 0.316862 1.67255 0.200195 2.00355 0.200195C2.33455 0.200195 2.61672 0.318029 2.85005 0.553696C3.08338 0.789362 3.20005 1.0727 3.20005 1.4037C3.20005 1.7347 3.08222 2.01686 2.84655 2.2502C2.61088 2.48353 2.32755 2.6002 1.99655 2.6002ZM5.99655 2.6002C5.66555 2.6002 5.38338 2.48236 5.15005 2.2467C4.91672 2.01103 4.80005 1.72769 4.80005 1.3967C4.80005 1.06569 4.91788 0.783529 5.15355 0.550195C5.38922 0.316862 5.67255 0.200195 6.00355 0.200195C6.33455 0.200195 6.61672 0.318029 6.85005 0.553696C7.08338 0.789362 7.20005 1.0727 7.20005 1.4037C7.20005 1.7347 7.08222 2.01686 6.84655 2.2502C6.61088 2.48353 6.32755 2.6002 5.99655 2.6002Z"
            fill="currentColor"
          />
        </g>
      </svg>
    </div>
  );
}
