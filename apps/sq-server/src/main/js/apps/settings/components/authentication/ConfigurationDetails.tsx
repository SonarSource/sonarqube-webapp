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

import { Button, ButtonVariety, Tooltip } from '@sonarsource/echoes-react';
import { ReactElement } from 'react';
import { FlagMessage, SubHeading } from '~design-system';
import { translate } from '~sq-server-commons/helpers/l10n';

interface Props {
  canDisable: boolean;
  enabled: boolean;
  extraActions?: ReactElement;
  isDeleting: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onToggle: () => void;
  title: string;
  url: string | string[] | undefined;
}

export default function ConfigurationDetails(props: Readonly<Props>) {
  const { title, url, canDisable, onEdit, onDelete, onToggle, extraActions, isDeleting, enabled } =
    props;

  return (
    <div className="sw-flex sw-mb-6 sw-justify-between">
      <div className="sw-min-w-0">
        <SubHeading as="h5" className="sw-truncate" title={title}>
          {title}
        </SubHeading>
        <p>{url}</p>
        {enabled ? (
          <Button className="sw-mt-4" isDisabled={!canDisable} onClick={onToggle}>
            {translate('settings.authentication.form.disable')}
          </Button>
        ) : (
          <Button
            className="sw-mt-4"
            isDisabled={!canDisable}
            onClick={onToggle}
            variety={ButtonVariety.Primary}
          >
            {translate('settings.authentication.form.enable')}
          </Button>
        )}
        {!canDisable && (
          <FlagMessage className="sw-mt-2" variant="warning">
            {translate('settings.authentication.form.disable.tooltip')}
          </FlagMessage>
        )}
      </div>
      <div className="sw-flex sw-gap-2 sw-flex-nowrap sw-shrink-0">
        {extraActions}
        <Button onClick={onEdit}>{translate('settings.authentication.form.edit')}</Button>
        <Tooltip
          content={
            enabled || isDeleting ? translate('settings.authentication.form.delete.tooltip') : null
          }
        >
          <Button
            isDisabled={enabled || isDeleting}
            onClick={onDelete}
            variety={ButtonVariety.DangerOutline}
          >
            {translate('settings.authentication.form.delete')}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
