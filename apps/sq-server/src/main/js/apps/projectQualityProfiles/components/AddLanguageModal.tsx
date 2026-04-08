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

import { Form, ModalForm, Select } from '@sonarsource/echoes-react';
import { difference } from 'lodash';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import withLanguages, {
  WithLanguagesProps,
} from '~sq-server-commons/context/languages/withLanguages';
import { LabelValueSelectOption } from '~sq-server-commons/helpers/search';
import { BaseProfile } from '~sq-server-commons/types/quality-profiles';
import ProfileSelect from './ProfileSelect';

export interface AddLanguageModalProps extends WithLanguagesProps {
  onClose: () => void;
  onSubmit: (key: string) => Promise<void>;
  profilesByLanguage: Record<string, BaseProfile[]>;
  unavailableLanguages: string[];
}

export function AddLanguageModal(props: AddLanguageModalProps) {
  const { languagesWithRules: languages, profilesByLanguage, unavailableLanguages } = props;
  const { formatMessage } = useIntl();

  const [{ language, key }, setSelected] = React.useState<{ key?: string; language?: string }>({
    language: undefined,
    key: undefined,
  });

  const languageOptions: LabelValueSelectOption[] = difference(
    Object.keys(profilesByLanguage).filter((lang) => languages[lang]),
    unavailableLanguages,
  ).map((l) => ({ value: l, label: languages[l].name }));

  const onFormSubmit = () => {
    if (!language || !key) {
      return;
    }

    return props.onSubmit(key);
  };

  return (
    <ModalForm
      content={
        <Form.Section>
          <Select
            className="sw-mb-4"
            data={languageOptions}
            label={
              <FormattedMessage id="project_quality_profile.add_language_modal.choose_language" />
            }
            onChange={(value: string) => {
              setSelected({ language: value, key: undefined });
            }}
            value={language}
            width="full"
          />
          <ProfileSelect
            className="sw-mb-4"
            id="profiles"
            isDisabled={!language}
            label={
              <FormattedMessage id="project_quality_profile.add_language_modal.choose_profile" />
            }
            onChange={(value: string) => {
              setSelected({ language, key: value });
            }}
            profiles={language ? profilesByLanguage[language] : []}
            value={key}
            width="full"
          />
        </Form.Section>
      }
      isDefaultOpen
      isSubmitDisabled={!language || !key}
      onClose={props.onClose}
      onSubmit={onFormSubmit}
      secondaryButtonLabel={<FormattedMessage id="cancel" />}
      submitButtonLabel={<FormattedMessage id="save" />}
      title={formatMessage({ id: 'project_quality_profile.add_language_modal.title' })}
    />
  );
}

export default withLanguages(AddLanguageModal);
