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
import { difference } from 'lodash';
import * as React from 'react';
import { FormField, InputSelect, Modal } from '~design-system';
import withLanguagesContext from '~sq-server-shared/context/languages/withLanguagesContext';
import { translate } from '~sq-server-shared/helpers/l10n';
import { LabelValueSelectOption } from '~sq-server-shared/helpers/search';
import { Languages } from '~sq-server-shared/types/languages';
import { BaseProfile, ProfileOption } from '~sq-server-shared/types/quality-profiles';
import { Dict } from '~sq-server-shared/types/types';
import LanguageProfileSelectOption from './LanguageProfileSelectOption';

export interface AddLanguageModalProps {
  languages: Languages;
  onClose: () => void;
  onSubmit: (key: string) => Promise<void>;
  profilesByLanguage: Dict<BaseProfile[]>;
  unavailableLanguages: string[];
}

export function AddLanguageModal(props: AddLanguageModalProps) {
  const { languages, profilesByLanguage, unavailableLanguages } = props;

  const [{ language, key }, setSelected] = React.useState<{ key?: string; language?: string }>({
    language: undefined,
    key: undefined,
  });

  const header = translate('project_quality_profile.add_language_modal.title');

  const languageOptions: LabelValueSelectOption[] = difference(
    Object.keys(profilesByLanguage),
    unavailableLanguages,
  ).map((l) => ({ value: l, label: languages[l].name }));

  const profileOptions: ProfileOption[] =
    language !== undefined
      ? profilesByLanguage[language].map((p) => ({
          value: p.key,
          label: p.name,
          language,
          isDisabled: p.activeRuleCount === 0,
        }))
      : [];

  const onFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (language && key) {
      props.onSubmit(key);
    }
  };

  const renderForm = (
    <form id="add-language-quality-profile" onSubmit={onFormSubmit}>
      <div>
        <FormField
          className="sw-mb-4"
          htmlFor="language"
          label={translate('project_quality_profile.add_language_modal.choose_language')}
        >
          <InputSelect
            aria-label={translate('project_quality_profile.add_language_modal.choose_language')}
            id="language"
            onChange={({ value }: LabelValueSelectOption) => {
              setSelected({ language: value, key: undefined });
            }}
            options={languageOptions}
            size="full"
          />
        </FormField>

        <FormField
          className="sw-mb-4"
          htmlFor="profiles"
          label={translate('project_quality_profile.add_language_modal.choose_profile')}
        >
          <InputSelect
            aria-label={translate('project_quality_profile.add_language_modal.choose_profile')}
            components={{
              Option: LanguageProfileSelectOption,
            }}
            id="profiles"
            isDisabled={!language}
            onChange={({ value }: ProfileOption) => {
              setSelected({ language, key: value });
            }}
            options={profileOptions}
            size="full"
            value={profileOptions.find((o) => o.value === key) ?? null}
          />
        </FormField>
      </div>
    </form>
  );

  return (
    <Modal
      body={renderForm}
      headerTitle={header}
      isOverflowVisible
      onClose={props.onClose}
      primaryButton={
        <Button
          form="add-language-quality-profile"
          isDisabled={!language || !key}
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

export default withLanguagesContext(AddLanguageModal);
