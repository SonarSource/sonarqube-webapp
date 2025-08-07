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

import { useIntl } from 'react-intl';
import useEffectOnce from '../../helpers/useEffectOnce';
import { A11ySkipLink } from '../../types/common';
import { A11yContext } from './A11yContext';

interface Props {
  anchor: string;
  label?: string;
  weight?: number;
}

export default function A11ySkipTarget(props: Readonly<Props>) {
  return (
    <A11yContext.Consumer>
      {({ addA11ySkipLink, removeA11ySkipLink }) => (
        <A11ySkipTargetInner
          addA11ySkipLink={addA11ySkipLink}
          removeA11ySkipLink={removeA11ySkipLink}
          {...props}
        />
      )}
    </A11yContext.Consumer>
  );
}

interface InnerProps {
  addA11ySkipLink: (link: A11ySkipLink) => void;
  removeA11ySkipLink: (link: A11ySkipLink) => void;
}

export function A11ySkipTargetInner(props: Readonly<Props & InnerProps>) {
  const intl = useIntl();

  const {
    addA11ySkipLink,
    removeA11ySkipLink,
    anchor,
    label = intl.formatMessage({ id: 'skip_to_content' }),
    weight,
  } = props;

  useEffectOnce(() => {
    const link: A11ySkipLink = { key: anchor, label, weight };

    addA11ySkipLink(link);

    return () => {
      removeA11ySkipLink(link);
    };
  });

  return <span id={`a11y_target__${anchor}`} />;
}
