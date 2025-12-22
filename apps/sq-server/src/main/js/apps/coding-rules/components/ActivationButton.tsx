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

import { Button, ButtonVariety, DropdownMenu } from '@sonarsource/echoes-react';
import { MouseEvent, useState } from 'react';
import { Rule, RuleActivationAdvanced, RuleDetails } from '~shared/types/rules';
import { BaseProfile } from '~sq-server-commons/types/quality-profiles';
import ActivationFormModal from './ActivationFormModal';

interface ActivationButtonProps {
  activation?: RuleActivationAdvanced;
  ariaLabel?: string;
  buttonText: string;
  className?: string;
  inDropdown?: boolean;
  modalHeader: string;
  onDone?: (severity: string, prioritizedRule: boolean) => Promise<void> | void;
  profiles: BaseProfile[];
  rule: Rule | RuleDetails;
}

export default function ActivationButton(props: Readonly<ActivationButtonProps>) {
  const { className, ariaLabel, buttonText, activation, modalHeader, profiles, inDropdown, rule } =
    props;
  const [modalOpen, setModalOpen] = useState(false);

  const buttonProps = {
    ariaLabel,
    className,
    onClick: (e: MouseEvent<HTMLDivElement>) => {
      // Prevent dropdown menu from closing when clicking the button
      e.preventDefault();
      setModalOpen(true);
    },
    variety: ButtonVariety.Default,
  };

  return (
    <>
      {inDropdown ? (
        <DropdownMenu.ItemButton {...buttonProps}>{buttonText}</DropdownMenu.ItemButton>
      ) : (
        <Button {...buttonProps}>{buttonText}</Button>
      )}
      <ActivationFormModal
        activation={activation}
        isOpen={modalOpen}
        modalHeader={modalHeader}
        onClose={() => {
          setModalOpen(false);
        }}
        onDone={props.onDone}
        onOpenChange={setModalOpen}
        profiles={profiles}
        rule={rule}
      />
    </>
  );
}
