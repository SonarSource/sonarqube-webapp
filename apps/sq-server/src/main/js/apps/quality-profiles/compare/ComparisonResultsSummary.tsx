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

import { Text } from '@sonarsource/echoes-react';
import { FormattedMessage, useIntl } from 'react-intl';

interface Props {
  additionalCount: number;
  comparedProfileName?: string;
  fewerCount: number;
  profileName: string;
}

export default function ComparisonResultsSummary(props: Readonly<Props>) {
  const { profileName, comparedProfileName, additionalCount, fewerCount } = props;
  const intl = useIntl();

  if (additionalCount === 0 && fewerCount === 0) {
    return null;
  }

  if (additionalCount === 0 || fewerCount === 0) {
    return (
      <div className="sw-mb-4">
        <FormattedMessage
          id="quality_profile.summary_differences2"
          values={{
            profile: profileName,
            comparedProfile: comparedProfileName,
            difference:
              additionalCount === 0 ? (
                <Text colorOverride="echoes-color-text-danger">
                  {intl.formatMessage(
                    { id: 'quality_profile.summary_fewer' },
                    { count: fewerCount },
                  )}
                </Text>
              ) : (
                <Text colorOverride="echoes-color-text-success">
                  {intl.formatMessage(
                    { id: 'quality_profile.summary_additional' },
                    { count: additionalCount },
                  )}
                </Text>
              ),
          }}
        />
      </div>
    );
  }

  return (
    <div className="sw-mb-4">
      <FormattedMessage
        id="quality_profile.summary_differences1"
        values={{
          profile: profileName,
          comparedProfile: comparedProfileName,
          additional: (
            <Text colorOverride="echoes-color-text-success">
              {intl.formatMessage(
                { id: 'quality_profile.summary_additional' },
                { count: additionalCount },
              )}
            </Text>
          ),
          fewer: (
            <Text colorOverride="echoes-color-text-danger">
              {intl.formatMessage({ id: 'quality_profile.summary_fewer' }, { count: fewerCount })}
            </Text>
          ),
        }}
      />
    </div>
  );
}
