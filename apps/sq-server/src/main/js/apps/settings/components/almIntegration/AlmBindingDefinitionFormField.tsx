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

import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  ButtonSecondary,
  FlagMessage,
  FormField,
  InputField,
  InputTextArea,
  Link,
} from '~design-system';
import { DocLink } from '~sq-server-commons/helpers/doc-links';
import { useDocUrl } from '~sq-server-commons/helpers/docs';
import { translate, translateWithParameters } from '~sq-server-commons/helpers/l10n';
import { AlmBindingDefinitionBase } from '~sq-server-commons/types/alm-settings';
import '../../styles.css';

export interface AlmBindingDefinitionFormFieldProps<B extends AlmBindingDefinitionBase> {
  autoFocus?: boolean;
  help?: React.ReactNode;
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

  const toStatic = useDocUrl(DocLink.InstanceAdminEncryption);

  return (
    <FormField
      className="sw-mb-8"
      description={help}
      htmlFor={id}
      label={translate('settings.almintegration.form', id)}
      required={!optional}
    >
      {!showField && overwriteOnly && (
        <div className="sw-flex sw-items-center">
          <p className="sw-mr-2">{translate('settings.almintegration.form.secret.field')}</p>
          <ButtonSecondary
            aria-label={translateWithParameters(
              'settings.almintegration.form.secret.update_field_x',
              translate('settings.almintegration.form', id),
            )}
            onClick={() => {
              props.onFieldChange(propKey, '');
              setShowField(true);
            }}
          >
            {translate('settings.almintegration.form.secret.update_field')}
          </ButtonSecondary>
        </div>
      )}
      {showField &&
        (isTextArea ? (
          <InputTextArea
            id={id}
            isInvalid={isInvalid}
            maxLength={maxLength || 2000}
            onChange={(e) => {
              props.onFieldChange(propKey, e.currentTarget.value);
            }}
            required={!optional}
            rows={5}
            size="full"
            value={value}
          />
        ) : (
          <InputField
            autoFocus={autoFocus}
            id={id}
            isInvalid={isInvalid}
            maxLength={maxLength || 100}
            name={id}
            onChange={(e) => {
              props.onFieldChange(propKey, e.currentTarget.value);
            }}
            size="full"
            type="text"
            value={value}
          />
        ))}
      {showField && isSecret && (
        <FlagMessage className="sw-mt-2" variant="info">
          <span>
            <FormattedMessage
              id="settings.almintegration.form.secret.can_encrypt"
              values={{
                learn_more: <Link to={toStatic}>{translate('learn_more')}</Link>,
              }}
            />
          </span>
        </FlagMessage>
      )}
    </FormField>
  );
}
