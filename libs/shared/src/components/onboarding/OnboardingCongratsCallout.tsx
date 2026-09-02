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

import { MessageCallout, Text } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';

interface Props {
  className?: string;
  /** Number of repositories the bound DevOps platform exposes. */
  discovered: number;
}

/**
 * Shown next to the onboarding dashboard title once an organization is bound but has not imported
 * anything yet, to celebrate the binding and announce how many repositories it unlocked.
 */
export function OnboardingCongratsCallout({ className, discovered }: Readonly<Props>) {
  const { formatMessage } = useIntl();

  return (
    <MessageCallout
      className={className}
      title={formatMessage({ id: 'onboarding_dashboard.journey.congrats.title' })}
      variety="success"
    >
      <FormattedMessage
        id="onboarding_dashboard.journey.congrats.message"
        values={{
          b: (chunks) => <Text isHighlighted>{chunks}</Text>,
          count: discovered,
        }}
      />
    </MessageCallout>
  );
}
