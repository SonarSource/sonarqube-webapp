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

import {
  Button,
  ButtonVariety,
  Heading,
  HeadingSize,
  IconLink,
  Text,
} from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useBindingSettingsUrl } from '~adapters/helpers/useBindingSettingsUrl';
import { useOnboardingCurrentBinding } from '~adapters/helpers/useOnboardingCurrentBinding';
import { JourneyState } from '../../../types/types';

interface Props {
  state: JourneyState;
}

/**
 * "Organization binding" detail panel. Shows an unbound call-to-action or, once the org is bound,
 * the current binding plus a link to the binding settings.
 */
export function OrganizationBindingPanel({ state }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const bindingSettingsUrl = useBindingSettingsUrl();
  const currentBinding = useOnboardingCurrentBinding();

  return (
    <div className="sw-flex sw-flex-col sw-gap-4">
      <Heading as="h3" size={HeadingSize.Small}>
        {formatMessage({ id: 'onboarding_dashboard.journey.binding.title' })}
      </Heading>

      <Text as="p" isSubtle>
        <FormattedMessage id="onboarding_dashboard.journey.binding.description" />
      </Text>

      {state.isBound ? (
        <>
          {currentBinding !== undefined && (
            <div className="sw-flex sw-items-center sw-gap-2">
              <Text isSubtle>
                {formatMessage({ id: 'onboarding_dashboard.journey.binding.current' })}
              </Text>
              <IconLink color="echoes-color-icon-subtle" />
              <Text isHighlighted>{currentBinding.organizationName}</Text>
              <Text isSubtle>→</Text>
              <Text isHighlighted>{currentBinding.devopsOrganizationName}</Text>
            </div>
          )}

          {bindingSettingsUrl !== undefined && (
            <div>
              <Button to={bindingSettingsUrl} variety={ButtonVariety.Default}>
                {formatMessage({ id: 'onboarding_dashboard.journey.binding.view_cta' })}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div>
          <Button prefix={<IconLink />} variety={ButtonVariety.Primary}>
            {formatMessage({ id: 'onboarding_dashboard.journey.binding.bind_cta' })}
          </Button>
        </div>
      )}
    </div>
  );
}
