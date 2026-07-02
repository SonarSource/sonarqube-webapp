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

import { ButtonIcon, ButtonVariety } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { QUALITY_GATE_HISTORY_ROUTE_NAME } from '../constants';
import { IconPulse } from './IconPulse';

interface Props {
  className?: string;
  projectKey: string;
}

/**
 * Icon link that navigates to the project's Quality Gate History page. Meant to sit next to the
 * quality gate status on the project summary/overview. The page itself is main-branch only.
 */
export function QualityGateHistoryLink(props: Readonly<Props>) {
  const { className, projectKey } = props;
  const { formatMessage } = useIntl();

  return (
    <ButtonIcon
      Icon={IconPulse}
      ariaLabel={formatMessage({ id: 'quality_gate_history.link.label' })}
      className={className}
      to={{
        pathname: `/${QUALITY_GATE_HISTORY_ROUTE_NAME}`,
        search: new URLSearchParams({ id: projectKey }).toString(),
      }}
      variety={ButtonVariety.PrimaryGhost}
    />
  );
}
