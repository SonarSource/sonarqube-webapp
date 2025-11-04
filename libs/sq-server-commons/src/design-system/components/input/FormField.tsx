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

import styled from '@emotion/styled';
import { cssVar, Label, Text } from '@sonarsource/echoes-react';
import { ReactNode } from 'react';
import tw from 'twin.macro';
import { RequiredIcon } from '../icons';

interface Props {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  description?: string | ReactNode;
  disabled?: boolean;
  help?: ReactNode;
  htmlFor?: string;
  id?: string;
  label: string | ReactNode;
  required?: boolean;
  requiredAriaLabel?: string;
  title?: string;
}

/**
 * @deprecated Use Echoes form components instead: TextInput, TextArea, Select, Checkbox, RadioGroup, etc.
 *
 * See the {@link https://xtranet-sonarsource.atlassian.net/wiki/spaces/Platform/pages/3863347214/Form#Compatible-Form-fields | Migration Guide} for more information.
 */
export function FormField({
  children,
  className,
  description,
  disabled,
  help,
  id,
  required,
  label,
  htmlFor,
  title,
  ariaLabel,
  requiredAriaLabel,
}: Readonly<Props>) {
  return (
    <FieldWrapper className={className} id={id}>
      <Text className="sw-mb-2 sw-flex sw-items-center sw-gap-2" isHighlighted>
        <StyledLabel aria-label={ariaLabel} disabled={disabled} htmlFor={htmlFor} title={title}>
          {label}
          {required && (
            <RequiredIcon aria-label={requiredAriaLabel ?? 'required'} className="sw-ml-1" />
          )}
        </StyledLabel>
        {help}
      </Text>

      {children}

      {description && (
        <Text className="sw-mt-2" isSubtle>
          {description}
        </Text>
      )}
    </FieldWrapper>
  );
}

// This is needed to prevent the target input/button from being focused
// when clicking/hovering on the label. More info https://stackoverflow.com/questions/9098581/why-is-hover-for-input-triggered-on-corresponding-label-in-css
const StyledLabel = styled(Label)<{ disabled?: boolean }>`
  pointer-events: none;
  color: ${({ disabled }) => (disabled ? cssVar('color-text-disabled') : 'inherit')};
`;

const FieldWrapper = styled.div`
  ${tw`sw-flex sw-flex-col sw-w-full`}

  &:not(:last-of-type) {
    ${tw`sw-mb-6`}
  }
`;
