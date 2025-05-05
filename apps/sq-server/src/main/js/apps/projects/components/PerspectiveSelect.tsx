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

import { Select } from '@sonarsource/echoes-react';
import * as React from 'react';
import { StyledPageTitle } from '~design-system';
import { translate } from '~sq-server-commons/helpers/l10n';
import { VIEWS } from '../utils';

interface Props {
  onChange: (x: { view: string }) => void;
  view: string;
}

export default function PerspectiveSelect(props: Readonly<Props>) {
  const { onChange, view } = props;

  const handleChange = React.useCallback(
    (value: string) => {
      onChange({ view: value });
    },
    [onChange],
  );

  const options = React.useMemo(
    () => VIEWS.map((opt) => ({ value: opt.value, label: translate('projects.view', opt.label) })),
    [],
  );

  return (
    <div className="sw-flex sw-items-center">
      <StyledPageTitle
        as="label"
        className="sw-typo-semibold sw-mr-2"
        id="aria-projects-perspective"
      >
        {translate('projects.perspective')}
      </StyledPageTitle>
      <Select
        ariaLabelledBy="aria-projects-perspective"
        className="sw-mr-4 sw-typo-default"
        data={options}
        hasDropdownAutoWidth
        isNotClearable
        onChange={handleChange}
        placeholder={translate('project_activity.filter_events')}
        value={view}
        width="small"
      />
    </div>
  );
}
