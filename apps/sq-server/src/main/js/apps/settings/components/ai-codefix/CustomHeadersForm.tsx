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
  ButtonIcon,
  ButtonVariety,
  Checkbox,
  IconDelete,
  IconLock,
  TextInput,
} from '@sonarsource/echoes-react';
import { useRef } from 'react';
import { useIntl } from 'react-intl';
import { CustomHeader, MASKED_SECRET } from '~sq-server-commons/queries/fix-suggestions';

interface CustomHeadersFormProps {
  headers: CustomHeader[];
  onAddHeader: () => void;
  onRemoveHeader: (index: number) => void;
  onUpdateHeader: (index: number, field: keyof CustomHeader, value: string | boolean) => void;
}

export function CustomHeadersForm({
  headers,
  onAddHeader,
  onRemoveHeader,
  onUpdateHeader,
}: Readonly<CustomHeadersFormProps>) {
  const { formatMessage } = useIntl();
  const nextId = useRef(headers.length);
  const keysRef = useRef<number[]>(headers.map((_, i) => i));

  if (keysRef.current.length < headers.length) {
    keysRef.current.push(nextId.current);
    nextId.current += 1;
  }

  return (
    <div className="sw-flex sw-flex-col sw-gap-4">
      {headers.map((header, index) => {
        const hasSavedSecret = header.secret && header.value === MASKED_SECRET;

        return (
          <div className="sw-flex sw-items-end sw-gap-3" key={keysRef.current[index]}>
            <TextInput
              label={formatMessage({ id: 'aicodefix.admin.custom_headers.header_name' })}
              onChange={(event) => {
                onUpdateHeader(index, 'name', event.target.value);
              }}
              value={header.name}
              width="medium"
            />

            <TextInput
              label={formatMessage({ id: 'aicodefix.admin.custom_headers.header_value' })}
              onChange={(event) => {
                onUpdateHeader(index, 'value', event.target.value);
              }}
              placeholder={
                hasSavedSecret
                  ? formatMessage({ id: 'aicodefix.admin.provider.secret.placeholder' })
                  : undefined
              }
              prefix={hasSavedSecret ? <IconLock /> : undefined}
              type={header.secret ? 'password' : 'text'}
              value={hasSavedSecret ? '' : header.value}
              width="medium"
            />

            <Checkbox
              checked={header.secret}
              label={formatMessage({ id: 'aicodefix.admin.custom_headers.secret' })}
              onCheck={(checked) => {
                onUpdateHeader(index, 'secret', checked);
              }}
            />

            <ButtonIcon
              Icon={IconDelete}
              ariaLabel={formatMessage(
                { id: 'aicodefix.admin.custom_headers.delete' },
                { name: header.name },
              )}
              onClick={() => {
                keysRef.current.splice(index, 1);
                onRemoveHeader(index);
              }}
              variety={ButtonVariety.DefaultGhost}
            />
          </div>
        );
      })}

      <Button
        className="sw-self-start sw-cursor-pointer"
        onClick={onAddHeader}
        variety={ButtonVariety.PrimaryGhost}
      >
        + {formatMessage({ id: 'aicodefix.admin.custom_headers.add' })}
      </Button>
    </div>
  );
}
