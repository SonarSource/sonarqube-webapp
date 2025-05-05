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
import { InputField, Modal } from '~design-system';
import { translate } from '~sq-server-commons/helpers/l10n';
import { useCreateEventMutation } from '~sq-server-commons/queries/project-analyses';
import { ParsedAnalysis } from '~sq-server-commons/types/project-activity';

interface Props {
  addEventButtonText: string;
  analysis: ParsedAnalysis;
  category?: string;
  onClose: () => void;
}

export default function AddEventForm(props: Readonly<Props>) {
  const { addEventButtonText, onClose, analysis, category } = props;
  const [name, setName] = React.useState('');
  const { mutate: createEvent } = useCreateEventMutation(onClose);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const data: Parameters<typeof createEvent>[0] = { analysis: analysis.key, name };

    if (category !== undefined) {
      data.category = category;
    }
    createEvent(data);
  };

  return (
    <Modal
      body={
        <form id="add-event-form">
          <label htmlFor="name">{translate('name')}</label>
          <InputField
            autoFocus
            className="sw-my-2"
            id="name"
            onChange={handleNameChange}
            size="full"
            type="text"
            value={name}
          />
        </form>
      }
      headerTitle={translate(addEventButtonText)}
      onClose={onClose}
      primaryButton={
        <Button
          form="add-event-form"
          id="add-event-submit"
          isDisabled={name === ''}
          onClick={handleSubmit}
          type="submit"
          variety={ButtonVariety.Primary}
        >
          {translate('save')}
        </Button>
      }
      secondaryButtonLabel={translate('cancel')}
    />
  );
}
