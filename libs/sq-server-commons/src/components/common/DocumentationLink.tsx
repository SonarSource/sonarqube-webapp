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

import { Link, LinkProps, LinkStandalone } from '@sonarsource/echoes-react';
import { Ref } from 'react';
import { SharedDocLink, useSharedDocUrl } from '~adapters/helpers/docs';
import { DocLink } from '../../helpers/doc-links';

type Props = Pick<LinkProps, 'className' | 'highlight' | 'shouldOpenInNewTab' | 'children'> & {
  innerRef?: Ref<HTMLAnchorElement>;
  standalone?: boolean;
  to: DocLink | SharedDocLink;
};

export default function DocumentationLink({ to, innerRef, standalone = false, ...props }: Props) {
  const toStatic = useSharedDocUrl(to);

  return standalone ? (
    <LinkStandalone ref={innerRef} to={toStatic} {...props} />
  ) : (
    <Link ref={innerRef} to={toStatic} {...props} />
  );
}
