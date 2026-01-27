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
  FormFieldValidation,
  FormFieldWidth,
  ModalAlert,
  Text,
  TextInput,
} from '@sonarsource/echoes-react';
import { ChangeEvent, useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { validateProjectKey } from '~sq-server-commons/helpers/projects';
import { ProjectKeyValidationResult } from '~sq-server-commons/types/component';
import { Component } from '~sq-server-commons/types/types';

interface UpdateFormProps {
  component: Pick<Component, 'key' | 'name'>;
  onKeyChange: (newKey: string) => Promise<void>;
}

export function UpdateForm({ component, onKeyChange }: Readonly<UpdateFormProps>) {
  const [newKey, setNewKey] = useState(component.key);
  const hasChanged = newKey !== component.key;
  const intl = useIntl();

  const validationResult = validateProjectKey(newKey);

  const error =
    validationResult === ProjectKeyValidationResult.Valid
      ? undefined
      : intl.formatMessage({
          id: `onboarding.create_project.project_key.error.${validationResult}`,
        });

  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setNewKey(e.currentTarget.value);
    },
    [setNewKey],
  );

  return (
    <form
      className="sw-mt-8"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <TextInput
        id="project-key-input"
        isRequired
        label={<FormattedMessage id="update_key.new_key" />}
        messageInvalid={error}
        onChange={onInputChange}
        type="text"
        validation={hasChanged && error ? FormFieldValidation.Invalid : undefined}
        value={newKey}
        width={FormFieldWidth.Large}
      />

      <div className="sw-mb-4 sw-mt-4 sw-w-abs-600">
        <Text as="p" isSubtle>
          <FormattedMessage id="onboarding.create_project.project_key.description" />
        </Text>
      </div>

      <div className="sw-mt-8">
        <ModalAlert
          content={
            <>
              <span>
                <FormattedMessage id="update_key.old_key" />
                :&nbsp;
                <strong className="sw-typo-lg-semibold">{component.key}</strong>
              </span>

              <div className="sw-mt-2">
                <FormattedMessage id="update_key.new_key" />
                :&nbsp;
                <strong className="sw-typo-lg-semibold">{newKey}</strong>
              </div>
            </>
          }
          description={intl.formatMessage(
            { id: 'update_key.are_you_sure_to_change_key' },
            { '0': component.name },
          )}
          primaryButton={
            <Button onClick={() => onKeyChange(newKey)} variety={ButtonVariety.Primary}>
              <FormattedMessage id="update_verb" />
            </Button>
          }
          title={intl.formatMessage({ id: 'update_key.page' })}
        >
          <Button
            id="update-key-submit"
            isDisabled={!hasChanged || error !== undefined}
            type="submit"
            variety={ButtonVariety.Primary}
          >
            <FormattedMessage id="update_verb" />
          </Button>
        </ModalAlert>

        <Button
          className="sw-ml-2"
          id="update-key-reset"
          isDisabled={!hasChanged}
          onClick={() => {
            setNewKey(component.key);
          }}
          type="reset"
          variety={ButtonVariety.Default}
        >
          <FormattedMessage id="reset_verb" />
        </Button>
      </div>
    </form>
  );
}
