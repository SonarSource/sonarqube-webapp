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
import { useStandardExperienceModeQuery } from '~sq-server-commons/queries/mode';
import {
  ChangelogEventAction,
  ProfileChangelogEvent,
} from '~sq-server-commons/types/quality-profiles';
import CleanCodeAttributeChange from './CleanCodeAttributeChange';
import ParameterChange from './ParameterChange';
import SeverityChange from './SeverityChange';
import SoftwareImpactChange from './SoftwareImpactChange';

interface Props {
  action: ChangelogEventAction;
  changes: ProfileChangelogEvent['params'];
}

export default function ChangesList({ changes, action }: Readonly<Props>) {
  const {
    severity,
    oldCleanCodeAttribute,
    oldCleanCodeAttributeCategory,
    newCleanCodeAttribute,
    newCleanCodeAttributeCategory,
    impactChanges,
    prioritizedRule,
    ...rest
  } = changes ?? {};
  const intl = useIntl();

  const { data: isStandardMode } = useStandardExperienceModeQuery();

  return (
    <ul className="sw-w-full sw-flex sw-flex-col sw-gap-1">
      {severity && isStandardMode && (
        <li>
          <SeverityChange severity={severity} />
        </li>
      )}

      {!isStandardMode &&
        oldCleanCodeAttribute &&
        oldCleanCodeAttributeCategory &&
        newCleanCodeAttribute &&
        newCleanCodeAttributeCategory && (
          <li>
            <CleanCodeAttributeChange
              newCleanCodeAttribute={newCleanCodeAttribute}
              newCleanCodeAttributeCategory={newCleanCodeAttributeCategory}
              oldCleanCodeAttribute={oldCleanCodeAttribute}
              oldCleanCodeAttributeCategory={oldCleanCodeAttributeCategory}
            />
          </li>
        )}

      {!isStandardMode &&
        impactChanges?.map((impactChange, index) => (
          <li key={index}>
            <SoftwareImpactChange impactChange={impactChange} />
          </li>
        ))}

      {typeof prioritizedRule === 'string' &&
        !(action === ChangelogEventAction.Activated && prioritizedRule === 'false') && (
          <li>
            {intl.formatMessage(
              { id: 'quality_profiles.changelog.prioritized_rule_changed' },
              { flag: prioritizedRule },
            )}
          </li>
        )}

      {Object.keys(rest).map((key) => (
        <li key={key}>
          <ParameterChange name={key} value={rest[key] as string | null} />
        </li>
      ))}
    </ul>
  );
}
