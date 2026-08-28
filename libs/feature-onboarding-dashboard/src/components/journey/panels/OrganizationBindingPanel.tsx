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
import { useCreateDevopsConfigurationUrl } from '~adapters/helpers/useCreateDevopsConfigurationUrl';
import { useOnboardingCurrentBinding } from '~adapters/helpers/useOnboardingCurrentBinding';
import { useOnboardingDevopsConfigurations } from '~adapters/helpers/useOnboardingDevopsConfigurations';
import { JourneyState } from '../../../types/types';
import { DevopsConfigurationsDonut } from './DevopsConfigurationsDonut';

interface Props {
  state: JourneyState;
}

// What this shows is driven by which adapters have something to answer, never by the product.
export function OrganizationBindingPanel({ state }: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const bindingSettingsUrl = useBindingSettingsUrl();
  const createConfigurationUrl = useCreateDevopsConfigurationUrl();
  const currentBinding = useOnboardingCurrentBinding();
  const { byPlatform } = useOnboardingDevopsConfigurations();

  // `Button` switches to an anchor on the *presence* of `to`, not on its value: `to={undefined}`
  // type-checks but renders `<a href="/">` instead of a plain button. Products with no destination
  // yet must therefore omit the prop entirely to keep the call-to-action inert.
  const bindCtaProps = {
    children: formatMessage({ id: 'onboarding_dashboard.journey.binding.bind_cta' }),
    prefix: <IconLink />,
    variety: ButtonVariety.Primary,
  } as const;

  // No per-platform split means a single binding to describe; otherwise the breakdown speaks for it.
  const showBindingReview = state.isBound && byPlatform === undefined;

  const showCreateCta = createConfigurationUrl !== undefined || !state.isBound;

  return (
    <div className="sw-flex sw-items-start sw-gap-8">
      {byPlatform !== undefined && byPlatform.length > 0 && (
        <DevopsConfigurationsDonut byPlatform={byPlatform} configured={state.configured} />
      )}

      <div className="sw-flex sw-min-w-0 sw-flex-1 sw-flex-col sw-gap-4">
        <Heading as="h3" size={HeadingSize.Small}>
          {formatMessage({ id: 'onboarding_dashboard.journey.binding.title' })}
        </Heading>

        <Text as="p" isSubtle>
          <FormattedMessage id="onboarding_dashboard.journey.binding.description" />
        </Text>

        {showBindingReview && (
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
        )}

        {showCreateCta && (
          <div>
            <Button
              {...bindCtaProps}
              {...(createConfigurationUrl !== undefined && { to: createConfigurationUrl })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
