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

import { Button, ButtonIcon, ButtonVariety, IconEdit, Layout } from '@sonarsource/echoes-react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocation, useNavigate } from 'react-router-dom';
import { Visibility } from '~shared/types/component';
import ChangeDefaultVisibilityForm from './ChangeDefaultVisibilityForm';

export interface Props {
  defaultProjectVisibility?: Visibility;
  hasProvisionPermission?: boolean;
  onChangeDefaultProjectVisibility: (visibility: Visibility) => void;
}

export function HeaderActions(props: Readonly<Props>) {
  const [visibilityForm, setVisibilityForm] = useState(false);
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const location = useLocation();

  const { defaultProjectVisibility, hasProvisionPermission } = props;

  return (
    <Layout.PageHeader.Actions className="it__page-actions">
      <div className="sw-mr-2 sw-flex sw-items-center">
        <span className="sw-mr-1">
          <FormattedMessage id="settings.projects.default_visibility_of_new_projects" />{' '}
          <strong className="sw-typo-semibold">
            {defaultProjectVisibility ? (
              <FormattedMessage id={`visibility.${defaultProjectVisibility}`} />
            ) : (
              '—'
            )}
          </strong>
        </span>
        <ButtonIcon
          Icon={IconEdit}
          ariaLabel={formatMessage({ id: 'settings.projects.change_visibility_form.label' })}
          className="it__change-visibility"
          onClick={() => {
            setVisibilityForm(true);
          }}
          variety={ButtonVariety.DefaultGhost}
        />
      </div>

      {hasProvisionPermission && (
        <Button
          id="create-project"
          onClick={() => {
            navigate('/projects/create?mode=manual', {
              state: { from: location.pathname },
            });
          }}
          variety={ButtonVariety.Primary}
        >
          <FormattedMessage id="qualifiers.create.TRK" />
        </Button>
      )}

      {visibilityForm && (
        <ChangeDefaultVisibilityForm
          defaultVisibility={defaultProjectVisibility ?? Visibility.Public}
          onClose={() => {
            setVisibilityForm(false);
          }}
          onConfirm={props.onChangeDefaultProjectVisibility}
        />
      )}
    </Layout.PageHeader.Actions>
  );
}
