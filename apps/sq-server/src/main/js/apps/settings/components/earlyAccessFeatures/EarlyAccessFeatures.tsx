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

import { Heading, Spinner, Text, TextSize } from '@sonarsource/echoes-react';
import { useIntl } from 'react-intl';
import { CardSeparator } from '~design-system';
import { isDefined } from '~shared/helpers/types';
import { addons } from '~sq-server-addons/index';
import { useAvailableFeatures } from '~sq-server-shared/context/available-features/withAvailableFeatures';
import { StaleTime } from '~sq-server-shared/queries/common';
import { useGetServiceInfoQuery } from '~sq-server-shared/queries/fix-suggestions';
import { useGetValueQuery } from '~sq-server-shared/queries/settings';
import { Feature } from '~sq-server-shared/types/features';
import { SettingsKey } from '~sq-server-shared/types/settings';
import AiCodeFixAdminCategory from '../ai-codefix/AiCodeFixAdminCategory';
import Sca from '../sca/Sca';
import { MISRACompliance } from './MISRACompliance';

export function EarlyAccessFeatures() {
  const { hasFeature } = useAvailableFeatures();
  const intl = useIntl();
  const { isLoading: loadingMisraSetting } = useGetValueQuery(
    { key: SettingsKey.MISRACompliance },
    { staleTime: StaleTime.NEVER },
  );
  const { data: aiCodeFixInfo, isLoading: loadingAiCodeFix } = useGetServiceInfoQuery({
    enabled: hasFeature(Feature.FixSuggestions),
  });

  const Architecture = addons.architecture?.ArchitectureEnablementForm;

  return (
    <>
      <Heading as="h2" className="sw-mb-4">
        {intl.formatMessage({ id: 'settings.early_access.title' })}
      </Heading>
      <Text as="p" className="sw-mb-4" size={TextSize.Large}>
        {intl.formatMessage({ id: 'settings.early_access.description' })}
      </Text>
      <div className="sw-flex sw-flex-col sw-gap-4">
        <Spinner isLoading={loadingAiCodeFix}>
          {aiCodeFixInfo?.subscriptionType === 'EARLY_ACCESS' && (
            <AiCodeFixAdminCategory headingTag="h3" />
          )}
        </Spinner>
        <Spinner isLoading={loadingMisraSetting}>
          <CardSeparator />
          <MISRACompliance />
        </Spinner>
        {hasFeature(Feature.ScaAvailable) && (
          <>
            <CardSeparator />
            <Sca />
          </>
        )}
        {hasFeature(Feature.Architecture) && isDefined(Architecture) && (
          <>
            <CardSeparator />
            <Architecture />
          </>
        )}
      </div>
    </>
  );
}
