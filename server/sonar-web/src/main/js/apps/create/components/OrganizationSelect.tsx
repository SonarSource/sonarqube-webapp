/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
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
import * as React from 'react';
import { sortBy } from 'lodash';
import Select from '../../../components/controls/Select';
import { Organization } from '../../../app/types';
import { translate } from '../../../helpers/l10n';
import { sanitizeAlmId } from '../../../helpers/almIntegrations';
import { getBaseUrl } from '../../../helpers/urls';

interface Props {
  onChange: (organization: Organization) => void;
  organization: string;
  organizations: Organization[];
}

export default function OrganizationSelect({ onChange, organization, organizations }: Props) {
  return (
    <Select
      autoFocus={true}
      className="input-super-large"
      clearable={false}
      id="select-organization"
      labelKey="name"
      onChange={onChange}
      optionRenderer={optionRenderer}
      options={sortBy(organizations, o => o.name.toLowerCase())}
      placeholder={translate('onboarding.import_organization.choose_organization')}
      required={true}
      value={organization}
      valueKey="key"
      valueRenderer={optionRenderer}
    />
  );
}

export function optionRenderer(organization: Organization) {
  const icon = organization.alm
    ? `sonarcloud/${sanitizeAlmId(organization.alm.key)}`
    : 'sonarcloud-square-logo';
  return (
    <span>
      <img
        alt={organization.alm ? organization.alm.key : 'SonarCloud'}
        className="spacer-right"
        height={14}
        src={`${getBaseUrl()}/images/${icon}.svg`}
      />
      {organization.name}
      <span className="note little-spacer-left">{organization.key}</span>
    </span>
  );
}
