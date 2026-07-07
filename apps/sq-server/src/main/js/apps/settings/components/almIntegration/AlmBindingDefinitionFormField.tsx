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

import { Button, Label, Text, TextArea, TextInput } from '@sonarsource/echoes-react';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import DocumentationLink from '~sq-server-commons/components/common/DocumentationLink';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { AlmBindingDefinitionBase } from '~sq-server-commons/types/alm-settings';
import '../../styles.css';

export interface AlmBindingDefinitionFormFieldProps<B extends AlmBindingDefinitionBase> {
  autoFocus?: boolean;
  help?: React.ReactElement | string;
  id: string;
  isInvalid?: boolean;
  isSecret?: boolean;
  isTextArea?: boolean;
  maxLength?: number;
  onFieldChange: (id: keyof B, value: string) => void;
  optional?: boolean;
  overwriteOnly?: boolean;
  propKey: keyof B;
  value: string;
}

export function AlmBindingDefinitionFormField<B extends AlmBindingDefinitionBase>(
  props: Readonly<AlmBindingDefinitionFormFieldProps<B>>,
) {
  const {
    autoFocus,
    help,
    id,
    isInvalid = false,
    isTextArea,
    maxLength,
    optional,
    overwriteOnly = false,
    propKey,
    value,
    isSecret,
  } = props;
  const [showField, setShowField] = React.useState(!overwriteOnly);
  const { formatMessage } = useIntl();

  const label = formatMessage({
    id: `settings.almintegration.form.${id}`,
  });

  return (
    <div className="sw-mb-8">
      {!showField && overwriteOnly ? (
        <>
          <Label className="sw-mb-2 sw-block" htmlFor={id}>
            {label}
          </Label>
          {help && (
            <Text as="p" className="sw-mb-2" isSubtle>
              {help}
            </Text>
          )}
          <div className="sw-flex sw-items-center">
            <p className="sw-mr-2">
              <FormattedMessage id="settings.almintegration.form.secret.field" />
            </p>
            <Button
              aria-label={formatMessage(
                {
                  id: 'settings.almintegration.form.secret.update_field_x',
                },
                { 0: label },
              )}
              onClick={() => {
                props.onFieldChange(propKey, '');
                setShowField(true);
              }}
            >
              <FormattedMessage id="settings.almintegration.form.secret.update_field" />
            </Button>
          </div>
        </>
      ) : (
        showField && (
          <>
            {isTextArea ? (
              <TextArea
                helpText={help}
                id={id}
                isRequired={!optional}
                label={label}
                maxLength={maxLength ?? 2000}
                name={id}
                onChange={(e) => {
                  props.onFieldChange(propKey, e.currentTarget.value);
                }}
                rows={5}
                validation={isInvalid ? 'invalid' : 'none'}
                value={value}
                width="full"
              />
            ) : (
              <TextInput
                autoFocus={autoFocus}
                helpText={help}
                id={id}
                isRequired={!optional}
                label={label}
                maxLength={maxLength ?? 100}
                name={id}
                onChange={(e) => {
                  props.onFieldChange(propKey, e.currentTarget.value);
                }}
                type="text"
                validation={isInvalid ? 'invalid' : 'none'}
                value={value}
                width="full"
              />
            )}
            {isSecret && (
              <Text as="p" className="sw-mt-2" isSubtle>
                <FormattedMessage
                  id="settings.almintegration.form.secret.can_encrypt"
                  values={{
                    learn_more: (
                      <DocumentationLink to={DocLink.InstanceAdminEncryption}>
                        <FormattedMessage id="learn_more" />
                      </DocumentationLink>
                    ),
                  }}
                />
              </Text>
            )}
          </>
        )
      )}
    </div>
  );
}
