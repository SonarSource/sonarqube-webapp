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

import { Button, ButtonVariety, Modal } from '@sonarsource/echoes-react';
import type { ReactNode } from 'react';
import { useIntl } from 'react-intl';

interface SectionModalLayoutProps {
  body: ReactNode;
  introDescription: string;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  primaryButtonDisabled: boolean;
  primaryButtonLabel: string;
  title: string;
}

export function SectionModalLayout(props: Readonly<SectionModalLayoutProps>) {
  const {
    body,
    introDescription,
    isOpen,
    onCancel,
    onConfirm,
    primaryButtonDisabled,
    primaryButtonLabel,
    title,
  } = props;
  const { formatMessage } = useIntl();

  return (
    <Modal
      content={body}
      description={introDescription}
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onCancel();
        }
      }}
      primaryButton={
        <Button
          isDisabled={primaryButtonDisabled}
          onClick={onConfirm}
          variety={ButtonVariety.Primary}
        >
          {primaryButtonLabel}
        </Button>
      }
      secondaryButton={
        <Button onClick={onCancel} variety={ButtonVariety.Default}>
          {formatMessage({ id: 'cancel' })}
        </Button>
      }
      title={title}
    />
  );
}
