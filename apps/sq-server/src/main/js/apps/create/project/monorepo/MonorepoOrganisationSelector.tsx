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

import { Link, Spinner } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { DarkLabel, FlagMessage, InputSelect } from '~design-system';
import { useAppState } from '~sq-server-shared/context/app-state/withAppStateContext';
import { LabelValueSelectOption } from '~sq-server-shared/helpers/search';
import { AlmKeys } from '~sq-server-shared/types/alm-settings';

interface Props {
  almKey: AlmKeys;
  error: boolean;
  loadingOrganizations?: boolean;
  onSelectOrganization?: (organizationKey: string) => void;
  organizationOptions: LabelValueSelectOption[];
  selectedOrganization?: LabelValueSelectOption;
}

export function MonorepoOrganisationSelector({
  almKey,
  error,
  loadingOrganizations,
  onSelectOrganization,
  organizationOptions,
  selectedOrganization,
}: Readonly<Props>) {
  const { formatMessage } = useIntl();
  const { canAdmin } = useAppState();

  return (
    !error && (
      <>
        <DarkLabel className="sw-mb-2" htmlFor={`${almKey}-monorepo-choose-organization`}>
          <FormattedMessage id="onboarding.create_project.monorepo.choose_organization" />
        </DarkLabel>

        <Spinner isLoading={loadingOrganizations && !error}>
          {organizationOptions.length > 0 ? (
            <InputSelect
              inputId={`${almKey}-monorepo-choose-organization`}
              isSearchable
              onChange={({ value }: LabelValueSelectOption) => {
                if (onSelectOrganization) {
                  onSelectOrganization(value);
                }
              }}
              options={organizationOptions}
              placeholder={formatMessage({
                id: 'onboarding.create_project.monorepo.choose_organization.placeholder',
              })}
              size="full"
              value={selectedOrganization}
            />
          ) : (
            !loadingOrganizations && (
              <FlagMessage className="sw-mb-2" variant="error">
                <span>
                  {canAdmin ? (
                    <FormattedMessage
                      defaultMessage={formatMessage({
                        id: 'onboarding.create_project.monorepo.no_orgs_admin',
                      })}
                      id="onboarding.create_project.monorepo.no_orgs_admin"
                      values={{
                        almKey,
                        link: (
                          <Link to="/admin/settings?category=almintegration">
                            <FormattedMessage id="onboarding.create_project.monorepo.warning.message_admin.link" />
                          </Link>
                        ),
                      }}
                    />
                  ) : (
                    <FormattedMessage id="onboarding.create_project.monorepo.no_orgs" />
                  )}
                </span>
              </FlagMessage>
            )
          )}
        </Spinner>
      </>
    )
  );
}
