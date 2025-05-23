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

import * as Echoes from '@sonarsource/echoes-react';
import classNames from 'classnames';
import * as React from 'react';
import Tooltip, { Placement } from '../../../components/controls/Tooltip';
import { HelperHintIcon } from '../../../design-system';
import { translate } from '../../../helpers/l10n';

interface Props {
  'aria-label'?: string;
  children?: React.ReactNode;
  className?: string;
  'data-testid'?: string;
  overlay: React.ReactNode;
  placement?: Placement;
}

const DEFAULT_SIZE = 12;

/**
 * @deprecated Use {@link Echoes.ToggleTip | ToggleTip} from Echoes instead.
 *
 * Contrary to HelpTooltip the ToggleTip is interactive and accessible, it's based on a button and must be clicked to display its popover.
 *
 * Some of the props have changed or been removed:
 * - `aria-label` is now `ariaLabel` and is used to replace the default label that says "More information"
 * - ~`children`~ doesn't exist anymore, the icon is now fixed and can't be replaced by a custom one
 * - ~`data-testid`~ doesn't exist anymore, the tooltip should be accessible with its aria-label
 * - `overlay` is now a combination of `title`, `description` and `footer`
 * - `extraContent` is a new prop that's unformatted and can be used for complex content,
 * most ToggleTips should rely on `description` and `footer` props instead
 *
 * See the {@link https://xtranet-sonarsource.atlassian.net/wiki/spaces/Platform/pages/3774513191/ToggleTips | Migration Guide} for more information.
 */
export default function HelpTooltip(props: Readonly<Props>) {
  const { overlay, placement, children } = props;
  return (
    <div
      className={classNames(
        'it__help-tooltip sw-inline-flex sw-items-center sw-align-middle',
        props.className,
      )}
    >
      <Tooltip content={overlay} mouseLeaveDelay={0.25} side={placement}>
        <span
          aria-label={props['aria-label']}
          className="sw-inline-flex sw-items-center"
          data-testid={props['data-testid'] ?? 'help-tooltip-activator'}
        >
          {children ?? (
            <HelperHintIcon
              aria-label={translate('help')}
              description={overlay}
              height={DEFAULT_SIZE}
              width={DEFAULT_SIZE}
            />
          )}
        </span>
      </Tooltip>
    </div>
  );
}
