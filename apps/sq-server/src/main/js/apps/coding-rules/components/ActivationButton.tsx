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

import { Button, ButtonVariety } from '@sonarsource/echoes-react';
import * as React from 'react';
import { Rule, RuleActivationAdvanced, RuleDetails } from '~shared/types/rules';
import { BaseProfile } from '~sq-server-commons/types/quality-profiles';
import ActivationFormModal from './ActivationFormModal';

interface Props {
  activation?: RuleActivationAdvanced;
  ariaLabel?: string;
  buttonText: string;
  className?: string;
  modalHeader: string;
  onDone?: (severity: string, prioritizedRule: boolean) => Promise<void> | void;
  profiles: BaseProfile[];
  rule: Rule | RuleDetails;
}

export default function ActivationButton(props: Props) {
  const { className, ariaLabel, buttonText, activation, modalHeader, profiles, rule } = props;
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <>
      <Button
        ariaLabel={ariaLabel}
        className={className}
        id="coding-rules-quality-profile-activate"
        onClick={() => {
          setModalOpen(true);
        }}
        variety={ButtonVariety.Default}
      >
        {buttonText}
      </Button>

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
