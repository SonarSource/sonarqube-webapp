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

import { getBaseUrl } from '../../../helpers/system';

export function Image(props: Readonly<JSX.IntrinsicElements['img']>) {
  const { alt, src: source, ...rest } = props;

  const baseUrl = getBaseUrl();

  let src = source;

  if (
    src !== undefined &&
    !src.startsWith(baseUrl) &&
    !src.startsWith('http') &&
    !src.startsWith('data:')
  ) {
    src = `${baseUrl}/${src}`.replace(/(?<!:)\/+/g, '/');
  }

  // eslint-disable-next-line react/forbid-elements
  return <img alt={alt} src={src} {...rest} />;
}
